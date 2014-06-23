/** @jsx React.DOM */

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var http = require('http');
var spawn = require('child_process').spawn;

var App = React.createClass({
  getInitialState: function() {
    return {
      blogDidLoad: false,
      editMode: false,
      blogPath: '',
      posts: [],
      url: 'http://localhost:4000'
    }
  },
  setPath: function(path) {
    this.setState({ path: path });
  },
  setPosts: function(posts) {
    this.setState({ posts: posts });
  },
  setBlogDidLoad: function(value) {
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
        setPath={this.setPath}
        setPosts={this.setPosts}
      />
    );
  }
});

var Home = React.createClass({
  getInitialState: function() {
    return {
      savingText: ''
    }
  },
  componentDidMount: function() {
    this.refs.fileDialog.getDOMNode().setAttribute('nwdirectory', '');
    this.refs.fileDialog.getDOMNode().addEventListener('change', this.setPath);

    this.refs.motionLoop.getDOMNode().setAttribute('autoplay', '');
    this.refs.motionLoop.getDOMNode().setAttribute('loop', '');
  },
  componentDidUpdate: function() {
    if (this.props.blogDidLoad) {
      this.refs.myIframe.getDOMNode().addEventListener('load', this.iframeDidLoad, true);
    }
  },
  iframeDidLoad: function() {
    var appLocalPath = window.location.pathname.split('/').slice(0,-1).join('/');

    var path = this.refs.myIframe.getDOMNode().contentWindow.location.pathname;
    var url = path.replace(/\//g, '');
    var posts = _.map(this.props.posts, function(post) { return post.split('-').slice(3).join('-').split('.').shift() });

    if (_.contains(posts, url)) {
      this.props.setEditMode(true);

      var container = this.refs.myIframe.getDOMNode().contentWindow.document.getElementsByClassName('post-content')[0];
      container.style.outline = 'none';

      // pen.js file
      var script = this.refs.myIframe.getDOMNode().contentWindow.document.createElement('script');
      script.type = 'text/javascript';

      script.onload = function(){
        console.log('pen loaded inside iframe');

        // instantiate pen
        var scriptInline = this.refs.myIframe.getDOMNode().contentWindow.document.createElement('script');
        scriptInline.type = 'text/javascript';
        scriptInline.text = 'var editor = new Pen(document.getElementsByClassName("post-content")[0]);';
        this.refs.myIframe.getDOMNode().contentWindow.document.getElementsByTagName('head')[0].appendChild(scriptInline);
      }.bind(this);

      script.src = 'file://' + appLocalPath + '/assets/js/lib/pen.js';
      this.refs.myIframe.getDOMNode().contentWindow.document.getElementsByTagName('head')[0].appendChild(script);

      // pen styles
      var cssLink = this.refs.myIframe.getDOMNode().contentWindow.document.createElement('link');
      cssLink.href = 'file://' + appLocalPath + '/assets/css/lib/pen.css';
      cssLink.rel = 'stylesheet';
      cssLink.type = 'text/css';
      this.refs.myIframe.getDOMNode().contentWindow.document.getElementsByTagName('head')[0].appendChild(cssLink);
    }

    this.refs.myIframe.getDOMNode().contentWindow.document.addEventListener('keyup', _.debounce(this.handleKeyUp, 1000), true);
  },
  handleBlogDidLoad: function(value) {
    console.log('changing blog load value to ' + value);
    this.props.setBlogDidLoad(value);
  },
  handleClick: function() {
    this.refs.fileDialog.getDOMNode().click();
  },
  handlesetPosts: function(path) {
    var files = fs.readdirSync(path + '/_posts');

    var posts = _.filter(files, function(file) {
      var extension = file.split('.').pop();
      return extension === 'md' || extension === 'markdown'
    });

    this.props.setPosts(posts);
  },
  setPath: function(e) {
    this.props.setPath(e.target.value);

    var jekyll = spawn('jekyll', ['serve', '--watch', '-s', e.target.value]);

    jekyll.stdout.on('data', function (data) {
      var line = data.toString();
      var serverRunning = 'Server running...';
      var portInUse = 'Address already in use';
      if (line.match(serverRunning) && line.match(serverRunning).length ||
        line.match(portInUse) && line.match(portInUse).length) {
        this.handleBlogDidLoad(true);
      }
    }.bind(this));

    process.on('exit', function() {
      jekyll.kill();
    });

    this.handlesetPosts(e.target.value);
  },
  handleSave: function() {
    var postsDir = path.join(this.props.blogPath, '_posts');
    var location = this.refs.myIframe.getDOMNode().contentWindow.location.pathname;
    var postSlug = location.replace(/\//g, '');
    var container = this.refs.myIframe.getDOMNode().contentWindow.document.getElementsByClassName('post-content')[0];
    var markdown = md(container.innerHTML, { inline:true });
    markdown = markdown.replace('’', '\'');
    _.each(this.props.posts, function(postFile) {
      if (postFile.match(postSlug)) {
        var file = fs.readFileSync(path.join(postsDir, postFile), 'utf8');
        var yaml = file.split('---').slice(0,2);
        yaml.push('\n\n');
        yaml = yaml.join('---');
        fs.writeFileSync(path.join(postsDir, postFile), yaml);
        fs.appendFileSync(path.join(postsDir, postFile), markdown);
        console.log('File saved');
      }
    });
  },
  handleKeyUp: function(e) {
    if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {
      return false;
    }
    var self = this;
    this.setState({ savingText: 'Saving...' });
    this.handleSave();
    _.delay(function() { self.setState({ savingText: '' }); }, 1000);
  },
  render: function() {
    if (this.props.blogDidLoad) {
      return (
        <div>
          <Topbar
            handleSave={this.handleSave}
            savingText={this.state.savingText}
            blogDidLoad={this.props.blogDidLoad}
            editMode={this.props.editMode}
            blogPath={this.props.blogPath}
            setBlogDidLoad={this.props.setBlogDidLoad}
            setEditMode={this.props.setEditMode}
          />
          <iframe ref="myIframe" onKeyUp={this.handleKeyUp} src={this.props.url} width="100%" height="100%" frameBorder="0"></iframe>
        </div>
      );
    } else {
      return (
        <div className="home">
          <video ref="motionLoop">
            <source src="assets/video/videohive_glossy-silver.webmhd.webm" type="video/webm" />
          </video>
          <h1>Jekyll Blog Editor</h1>
          <button ref="openBlog" onClick={this.handleClick} className="btn outline">Open Blog</button>
          <input ref="fileDialog" type="file" className="hidden" />
          <h4>Select a local Jekyll blog</h4>
        </div>
      );
    }
  }
});


var Topbar = React.createClass({
  componentDidMount: function() {
    $('span[rel=tipsy]').tipsy({ fade: true });
  },
  componentDidUpdate: function() {
    $('span[rel=tipsy]').tipsy({ fade: true });
  },
  handleHome: function() {
    this.props.setBlogDidLoad(false);
    this.props.setEditMode(false);
  },
  handlePublish: function() {

  },
  handleNewPost: function() {

  },
  handleSettings: function() {

  },
  render: function() {
    if (this.props.editMode) {
      var publishLink = <li onClick={this.handlePublish}><span rel="tipsy" className="icon-publish" title="Publish to GitHub"></span></li>;
      var savingText = <li>{this.props.savingText}</li>;
    }
    var blogName = this.props.blogPath.split('/').slice(-1).toString();
    return (
      <div className="fixed">
        <nav className="top-bar">
          <section className="top-bar-section">
            <span rel="tipsy" className="title" title={this.props.blogPath}><strong>{blogName}</strong></span>
            <ul className="left">
              <li onClick={this.handleNewPost}><span rel="tipsy" className="icon-new" title="New"></span></li>
              {publishLink}
              {savingText}
            </ul>
            <ul className="right">
              <li onClick={this.handleSettings}><span rel="tipsy" className="icon-settings" title="Settings"></span></li>
              <li onClick={this.handleHome}><span rel="tipsy" className="icon-home" title="Home"></span></li>
            </ul>
          </section>
        </nav>
      </div>
    );
  }
});

React.renderComponent(<App />, document.body);

// ========================
// Node Webkit Live Reload
// ========================

var loc = './';

fs.watch(loc, function() {
  if (location) {
    location.reload();
  }
});