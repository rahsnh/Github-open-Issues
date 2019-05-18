//Dependent Import Modules
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import './react-bootstrap-table-all.min.css';
import CircularProgress from '@material-ui/core/CircularProgress';

//Styles
const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  toolbar: {
    backgroundColor: '#2196F3'
  },
  grid: {
    padding: theme.spacing.unit * 2,
    margin: 'auto',
    maxWidth: 500,
    marginTop: 10
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 440
  },
  cssLabel: {
    fontSize: 14,
    color: '#8C8C8C',
    marginTop: -8,
    '&$cssFocused': {
      color: '#2196F3',
      marginTop: 0
    },
  },
  cssFocused: {},
  cssOutlinedInput: {
    fontSize: 14,
    '&$cssFocused $notchedOutline': {
      borderColor: '#2196F3',
      borderWidth: 1
    },
  },
  notchedOutline: {},
  header: {
    marginTop: 20,
    marginBottom: 0,
    textAlign: 'center'
  },
  tables: {
    margin: '0px 40px'
  },
  tableHeader: {
    textAlign: 'center'
  },
  progress: {
    marginLeft: '49%'
  },
  error: {
    textAlign: 'center',
    fontWeight: 500
  }
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      value: '', //To store the github URL link entered in the input field
      today: 0, //Counter to count No of issues Within 24hrs
      last7days: 0, //Counter to count No of issues Within last 7 days
      before7days: 0, //Counter to count No of issues before 7 days
      data: [], //The retrieved JSON data from the Github Api
      ctr: 1,
      display: false, //State variable to toggle the table
      isLoading: false, //State variable to toggle Circular PRogress Bar
      error: '' //State variable to toggle erroe
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this); //Function to deal with the submit
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    var curr_date = new Date(); //Get current date
    var curr_time = curr_date.getTime() / 1000; //Get current Time
    var item_time, diff, diff_in_hrs, diff_in_days, total_issues, i; //Temmp Cariables
    var str = (this.state.value).match(/(https:\/\/github.com\/)(.*\/.*)/i); //To check whether the URL is valid
    this.setState({isLoading: true, display: false, today: 0, last7days: 0, before7days: 0, error: ''});
    if (str != null) {
      // Fetch the github api for the repository
      fetch('https://api.github.com/search/issues?q=repo:'+str[2]+'+type:issue+state:open&per_page=100')
      .then(res => res.json())
      .then(response => {
        if (!response.message) {
          total_issues = Math.ceil(response.total_count/100);
          response.items.forEach((item) => {
            item_time = (new Date(item.created_at)).getTime() / 1000;
            diff = Math.abs(curr_time - item_time);
            diff_in_hrs = diff/3600;
            diff_in_days = Math.round(diff_in_hrs/24);
            if (diff_in_days === 0) //to Check if the difference is within 24hrs
              this.setState({today: this.state.today+1})
            else if (diff_in_days <= 7) //to Check if the difference is within 7 days
              this.setState({last7days: this.state.last7days+1})
            else //to Check if the difference is before 7 days
              this.setState({before7days: this.state.before7days+1})
            if (total_issues === 1) {
              this.setState({display: true, isLoading: false});
              this.setState({data: [{today: this.state.today, last7days: this.state.last7days, before7days: this.state.before7days}]});
            }
          })
          //Since Github api can return a maximum of 100 results in one time, we have to again call api for the total no of issues
          if (total_issues > 1) {
            for (i=2; i<=total_issues; i++) {
              //api call for remaining results
              fetch('https://api.github.com/search/issues?q=repo:'+str[2]+'+type:issue+state:open&per_page=100&page='+i)
                .then(result => result.json())
                .then(results => {
                  results.items.forEach((item) => {
                    item_time = (new Date(item.created_at)).getTime() / 1000;
                    diff = Math.abs(curr_time - item_time);
                    diff_in_hrs = diff/3600;
                    diff_in_days = Math.round(diff_in_hrs/24);
                    if (diff_in_days === 0) 
                      this.setState({today: this.state.today+1})
                    else if (diff_in_days <= 7)
                      this.setState({last7days: this.state.last7days+1})
                    else
                      this.setState({before7days: this.state.before7days+1}) 
                  })
                  this.setState({ctr: this.state.ctr+1});
                  if (this.state.ctr === total_issues) {
                    this.setState({display: true, isLoading: false});
                    this.setState({data: [{today: this.state.today, last7days: this.state.last7days, before7days: this.state.before7days}]});
                  }
                })
            }
          }
        } else {
          this.setState({isLoading: false, error: 'Invalid Github Repository'});
        }
      });
    } else {
      this.setState({isLoading: false, error: 'Invalid URL'});
    }
    event.preventDefault();
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        {//Topbar}
        <AppBar position="static">
          <Toolbar className={classes.toolbar} variant="dense">
            <Typography variant="h4" color="inherit" className={classes.grow}>
              RADIUS
            </Typography>
          </Toolbar>
        </AppBar>
        <Grid className={classes.grid} container spacing={16}>
          <Grid item>
            <form onSubmit={this.handleSubmit}>
            <TextField
              InputLabelProps={{
                classes: {
                  root: classes.cssLabel,
                  focused: classes.cssFocused,
                },
              }}
              InputProps={{
                classes: {
                  root: classes.cssOutlinedInput,
                  focused: classes.cssFocused,
                  notchedOutline: classes.notchedOutline,
                },
              }}
              id="outlined-search"
              label="Enter Github Link and hit enter"
              type="search"
              className={classes.textField}
              value={this.state.value}
              onChange={this.handleChange}
              margin="normal"
              variant="outlined"
            />
            </form>
            <div className={classes.header}><b>No Of Open Issues</b></div>
          </Grid>
        </Grid>
        <div className={classes.error}>{this.state.error}</div>
        <div className={classes.tables}>
          {this.state.isLoading ? <CircularProgress className={classes.progress} />: (null)}
          {this.state.display ? 
            (
              <BootstrapTable data={this.state.data} striped hover>
                <TableHeaderColumn className={classes.tableHeader} isKey dataField='today'>Today</TableHeaderColumn>
                <TableHeaderColumn className={classes.tableHeader} dataField='last7days'>Last 7 Days</TableHeaderColumn>
                <TableHeaderColumn className={classes.tableHeader} dataField='before7days'>Before 7 Days</TableHeaderColumn>
              </BootstrapTable>
            ):(null)
          }
        </div>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);