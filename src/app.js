/** @jsx React.DOM */

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var http = require('http');
var spawn = require('child_process').spawn;

var App = React.createClass({
  componentDidMount: function() {
    document.body.classList.add('splash')
  },

  getInitialState: function() {
    return {
      blogDidLoad: false,
      editMode: false,
      blogPath: '',
      posts: [],
      url: 'http://localhost:4000'
    }
  },

  setBlogPath: function(path) {
    this.setState({ blogPath: path });
  },

  setPosts: function(posts) {
    this.setState({ posts: posts });
  },

  setBlogDidLoad: function(value) {
    if (!value) {
      document.body.classList.add('splash')
    } else {
      document.body.classList.remove('splash')
    }
    this.setState({ blogDidLoad: value })
  },

  setEditMode: function(value) {
    this.setState({ editMode: value });
  },

  render: function() {
    return (
      <Home
        url={this.state.url}
        posts={this.state.posts}
        editMode={this.state.editMode}
        blogDidLoad={this.state.blogDidLoad}
        blogPath={this.state.blogPath}
        setBlogDidLoad={this.setBlogDidLoad}
        setEditMode={this.setEditMode}
        setBlogPath={this.setBlogPath}
        setPosts={this.setPosts}
      />
    );
  }
});

React.renderComponent(<App />, document.body);
