/** @jsx React.DOM */

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var http = require('http');
var spawn = require('child_process').spawn;
var gui = require('nw.gui');

var Home = React.createClass({
  getInitialState: function() {
    return {
      appPath: window.location.pathname.split('/').slice(0,-1).join('/'),
      savingText: ''
    }
  },
  componentDidMount: function() {
    this.refs.fileDialog.getDOMNode().setAttribute('nwdirectory', '');
    this.refs.fileDialog.getDOMNode().addEventListener('change', this.updatePath);

    this.refs.motionLoop.getDOMNode().setAttribute('autoplay', '');
    this.refs.motionLoop.getDOMNode().setAttribute('loop', '');
  },
  componentDidUpdate: function() {
    if (this.props.blogDidLoad) {
      this.refs.myIframe.getDOMNode().addEventListener('load', this.iframeLoaded, true);
    }
  },
  iframeLoaded: function() {
    console.log('calling');
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

      script.src = 'file://' + this.state.appPath + '/assets/js/lib/pen.js';
      this.refs.myIframe.getDOMNode().contentWindow.document.getElementsByTagName('head')[0].appendChild(script);


      // pen styles
      var cssLink = this.refs.myIframe.getDOMNode().contentWindow.document.createElement('link');
      cssLink.href = 'file://' + this.state.appPath + '/assets/css/lib/pen.css';
      cssLink.rel = 'stylesheet';
      cssLink.type = 'text/css';
      this.refs.myIframe.getDOMNode().contentWindow.document.getElementsByTagName('head')[0].appendChild(cssLink);
    }

    this.refs.myIframe.getDOMNode().contentWindow.document.addEventListener('keyup', _.debounce(this.handleKeyUp, 1000), true);
  },
  handleBlogDidLoad: function(value) {
    this.props.updateBlogDidLoad(value);
  },
  handleClick: function() {
    this.refs.fileDialog.getDOMNode().click();
  },
  handleUpdatePosts: function(path) {
    var files = fs.readdirSync(path + '/_posts');

    var posts = _.filter(files, function(file) {
      var extension = file.split('.').pop();
      return extension === 'md' || extension === 'markdown'
    });

    this.props.updatePosts(posts);
  },
  updatePath: function(e) {
    this.props.updatePath(e.target.value);

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

    this.handleUpdatePosts(e.target.value);
  },
  save: function() {
    var postsDir = path.join(this.props.path, '_posts');
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
    if (e.keyCode == '37' || e.keyCode == '38' ||
      e.keyCode == '39' || e.keyCode == '40') {
      return false;
    }

    console.log('keyup' + e)
      this.save();

      this.setState({
        savingText: 'Saving...'
      });


      setTimeout(function() {
        this.setState({
          savingText: ''
        });
      }.bind(this), 1450);
  },
  render: function() {
    if (this.props.blogDidLoad) {
      document.body.classList.remove('cover');
      return (
        <div>
          <Topbar
            save={this.save}
            savingText={this.state.savingText}
            updateBlogDidLoad={this.props.updateBlogDidLoad}
            blogDidLoad={this.props.blogDidLoad}
            setEditMode={this.props.setEditMode}
            editMode={this.props.editMode}
            path={this.props.path}
          />
          <iframe ref="myIframe" onKeyUp={this.handleKeyUp} src={this.props.url} width="100%" height="100%" frameBorder="0"></iframe>
        </div>
      );
    } else {
      return (
        <div className="home">
          <video ref="motionLoop">
            <source src="assets/video/PeacefulFlow.webm" type="video/webm" />
          </video>
          <button ref="openBlog" onClick={this.handleClick} className="btn outline">Open Blog</button>
          <input ref="fileDialog" type="file" className="hidden" />
          <h4>Select a local Jekyll blog</h4>
        </div>
      );
    }
  }
});


var Topbar = React.createClass({
  render: function() {

    return (
      <div className="fixed">
        <nav className="top-bar">
          <TopbarLinks
            savingText={this.props.savingText}
            updateBlogDidLoad={this.props.updateBlogDidLoad}
            blogDidLoad={this.props.blogDidLoad}
            setEditMode={this.props.setEditMode}
            editMode={this.props.editMode}
            path={this.props.path}
          />
        </nav>
      </div>
    );
  }
});

var TopbarLinks = React.createClass({
  componentDidMount: function() {
    console.log('topbarlinks mounted')
    $('span[rel=tipsy]').tipsy({ fade: true, gravity: 'n' });
  },
  componentDidUpdate: function() {
    console.log('topbarlinks updated')
    $('span[rel=tipsy]').tipsy({ fade: true, gravity: 'n' });
  },
  handleHomeClick: function(e) {
    this.props.updateBlogDidLoad(false);
    this.props.setEditMode(false);
    document.body.classList.add('cover');
  },
  render: function() {
    var blogName = this.props.path.split('/').slice(-1).toString();

    if (this.props.editMode) {
      return (
        <section className="top-bar-section">
          <span rel="tipsy" className="title" title={this.props.path}><strong>{blogName}</strong></span>
          <ul className="left">
            <li onClick={this.handleNewClick}>
              <span rel="tipsy" className="icon-new" title="New"></span>
            </li>
            <li onClick={this.handlePublishClick}>
              <span rel="tipsy" className="icon-publish" title="Publish to GitHub"></span>
            </li>
            <li>{this.props.savingText}</li>
          </ul>
          <ul className="right">
            <li onClick={this.handleSettingsClick}>
              <span rel="tipsy" className="icon-settings" title="Settings"></span>
            </li>
            <li onClick={this.handleHomeClick}>
              <span rel="tipsy" className="icon-home" title="Home"></span>
            </li>
          </ul>
        </section>
        );
    } else {
      console.log('not in edit mode');
      return (
        <section className="top-bar-section">
          <span rel="tipsy" className="title" title={this.props.path}><strong>{blogName}</strong></span>
          <ul className="left">
            <li onClick={this.handleNewClick}>
              <span rel="tipsy" className="icon-new" title="New"></span>
            </li>
          </ul>
          <ul className="right">
            <li onClick={this.handleSettingsClick}>
              <span rel="tipsy" className="icon-settings" title="Settings"></span>
            </li>
            <li onClick={this.handleHomeClick}>
              <span rel="tipsy" className="icon-home" title="Home"></span>
            </li>
          </ul>

        </section>
        );
    }
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      blogDidLoad: false,
      editMode: false,
      path: '',
      url: 'http://localhost:4000',
      posts: []
    }
  },
  componentDidMount: function() {
    console.log('app loaded...')

  },
  updatePath: function(path) {
    this.setState({
      path: path
    });
  },
  updatePosts: function(posts) {
    this.setState({
      posts: posts
    });
  },
  updateBlogDidLoad: function(value) {
    this.setState({
      blogDidLoad: value
    })
  },
  setEditMode: function(value) {
    this.setState({
      editMode: value
    });
  },
  render: function() {
    return (
      <div>
        <Home
          setEditMode={this.setEditMode}
          blogDidLoad={this.state.blogDidLoad}
          updateBlogDidLoad={this.updateBlogDidLoad}
          editMode={this.state.editMode}
          updatePath={this.updatePath}
          updatePosts={this.updatePosts}
          path={this.state.path}
          url={this.state.url}
          posts={this.state.posts}
        />
      </div>
    );
  }
});

React.renderComponent(
  <App />,
  document.body
);

// ========================
// Live Reload
// ========================

var loc = './';

fs.watch(loc, function() {
  if (location)
    location.reload();
});