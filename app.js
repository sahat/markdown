/** @jsx React.DOM */

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var http = require('http');
var spawn = require('child_process').spawn;
var yaml = require('js-yaml');

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
  setBlogPath: function(path) {
    this.setState({ blogPath: path });
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
        setBlogPath={this.setBlogPath}
        setPosts={this.setPosts}
      />
    );
  }
});

var Home = React.createClass({
  getInitialState: function() {
    return {
      savingText: '',
      blogBaseUrl: '',
      frontMatter: null
    }
  },
  componentDidMount: function() {
    this.refs.fileDialog.getDOMNode().addEventListener('change', this.setBlogPath);
    this.refs.fileDialog.getDOMNode().setAttribute('nwdirectory', '');
    this.refs.motionLoop.getDOMNode().setAttribute('autoplay', '');
    this.refs.motionLoop.getDOMNode().setAttribute('loop', '');
  },
  componentDidUpdate: function() {
    if (this.props.blogDidLoad) {
      this.refs.myIframe.getDOMNode().addEventListener('load', this.iframeDidLoad, true);
    } else {
      this.refs.fileDialog.getDOMNode().addEventListener('change', this.setBlogPath);
      this.refs.fileDialog.getDOMNode().setAttribute('nwdirectory', '');
      this.refs.motionLoop.getDOMNode().setAttribute('autoplay', '');
      this.refs.motionLoop.getDOMNode().setAttribute('loop', '');
    }
  },
  injectScripts: function(iframe, appLocalPath) {
    var jsPen = iframe.document.createElement('script');
    var jsPenMarkdown = iframe.document.createElement('script');
    jsPenMarkdown.onload = function() {
      var initPen = iframe.document.createElement('script');
        var options = '{' +
        'editor: document.querySelector(".post-content"),' +
        'list: ["bold", "italic", "blockquote", "createlink", "outdent"]' +
      '}';
      initPen.text = 'var editor = new Pen(' + options + ');';
      iframe.document.querySelector('head').appendChild(initPen);
    };
    jsPen.src = 'file://' + appLocalPath + '/assets/js/lib/pen.js';
    jsPenMarkdown.src = 'file://' + appLocalPath + '/assets/js/lib/markdown.js';
    iframe.document.querySelector('head').appendChild(jsPen);
    iframe.document.querySelector('head').appendChild(jsPenMarkdown);
  },
  injectStyles: function(iframe, appLocalPath) {
    var editArea = iframe.document.querySelector('.post-content');
    editArea.style.outline = 'none';

    var cssPen = iframe.document.createElement('link');
    cssPen.href = 'file://' + appLocalPath + '/assets/css/lib/pen.css';
    cssPen.rel = 'stylesheet';
    iframe.document.querySelector('head').appendChild(cssPen);
  },
  iframeDidLoad: function() {
    var iframe = this.refs.myIframe.getDOMNode().contentWindow;
    var appLocalPath = window.location.pathname.split('/').slice(0,-1).join('/');
    var filename = iframe.location.pathname.replace(/\//g, '');
    var posts = _.map(this.props.posts, function(post) {
      return post.split('-').slice(3).join('-').split('.').shift()
    });
    if (_.contains(posts, filename)) {
      this.props.setEditMode(true);
      this.injectStyles(iframe, appLocalPath);
      this.injectScripts(iframe, appLocalPath);
    } else {
      this.props.setEditMode(false);
    }
    iframe.document.addEventListener('DOMSubtreeModified', _.debounce(this.handleDomChange, 550), true);
  },
  blogDidLoad: function(value) {
    console.log('changing blog load value to ' + value);
    this.props.setBlogDidLoad(value);
  },
  handleOpenBlog: function() {
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
  setBlogPath: function(e) {
    this.props.setBlogPath(e.target.value);

    var jekyll = spawn('jekyll', ['serve', '--watch', '-s', e.target.value]);

    jekyll.stdout.on('data', function (data) {
      var line = data.toString();
      var serverRunning = 'Server running...';
      var portInUse = 'Address already in use';
      if (line.match(serverRunning) && line.match(serverRunning).length ||
        line.match(portInUse) && line.match(portInUse).length) {
        this.blogDidLoad(true);
      }
    }.bind(this));

    process.on('exit', function() {
      jekyll.kill();
    });

    this.handlesetPosts(e.target.value);
  },
  handleSave: function() {
    var iframe = this.refs.myIframe.getDOMNode().contentWindow;
    var postsDir = path.join(this.props.blogPath, '_posts');
    var postSlug = iframe.location.pathname.replace(/\//g, '');
    var container = iframe.document.querySelector('.post-content');
    var markdown = md(container.innerHTML, { inline:true });
    markdown = markdown.replace('’', '\'');
    var self = this;
    _.each(this.props.posts, function(postFile) {
      if (postFile.match(postSlug)) {
        var file = fs.readFileSync(path.join(postsDir, postFile), 'utf8');
        var frontMatter = file.split('---').slice(0,2);
        if (self.state.frontMatter) {
          console.log(self.stateFrontMatter)
          frontMatter[1] = self.state.frontMatter
        } else {
          self.setState({ frontMatter: frontMatter[1] });
        }

        window.frontMatter = frontMatter;
//        frontMatter[1] = frontMatter[1].trim();
        frontMatter.push('\n\n');
        frontMatter = frontMatter.join('---');
        console.log(frontMatter);
        fs.writeFileSync(path.join(postsDir, postFile), frontMatter);
        fs.appendFileSync(path.join(postsDir, postFile), markdown);
        console.log('File saved');
      }
    });
  },
  handleHome: function() {
    var iframe = this.refs.myIframe.getDOMNode().contentWindow;
    iframe.location = iframe.location.origin;
  },
  handleDomChange: function(e) {
    var self = this;
    this.setState({ savingText: 'Saving...' });
    this.handleSave();
    _.delay(function() { self.setState({ savingText: '' }); }, 900);
  },
  displayModal: function() {
    this.refs.modal.show();
  },
  displayNewPostDialog: function() {
    this.refs.newPostDialog.show();
  },
  updateFrontMatter: function(data) {
    var frontMatter = this.state.frontMatter;
    var yamlObject = yaml.load(frontMatter);
    yamlObject.layout = data.layout;
    yamlObject.title = data.title;
    yamlObject.excerpt = data.excerpt;
    yamlObject.image = data.image;
    frontMatter = yaml.dump(yamlObject);
    frontMatter = '\n' + frontMatter;
    this.setState({ frontMatter: frontMatter });
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
            blogBaseUrl={this.state.blogBaseUrl}
            handleHome={this.handleHome}
            displayModal={this.displayModal}
            displayNewPostDialog={this.displayNewPostDialog}
          />
          <ModalDialog
            ref='modal'
            frontMatter={this.state.frontMatter}
            updateFrontMatter={this.updateFrontMatter}
          />
          <NewPostDialog
            ref='newPostDialog'
            updateFrontMatter={this.updateFrontMatter}
          />
          <iframe ref="myIframe" src={this.props.url} width="100%" height="100%" frameBorder="0"></iframe>
        </div>
      );
    } else {
      return (
        <div className="home">
          <video ref="motionLoop">
            <source src="assets/video/videohive_glossy-silver.webmhd.webm" type="video/webm" />
          </video>
          <h1>Jekyll Blog Editor</h1>
          <button ref="openBlog" onClick={this.handleOpenBlog} className="outline">Open Blog</button>
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
  handleExit: function() {
    this.props.setBlogDidLoad(false);
    this.props.setEditMode(false);
  },
  handlePublish: function() {

  },
  handleNewPost: function() {
    var today = new Date().toJSON().slice(0,10);
    this.props.displayNewPostDialog();
//    fs.writeFileSync(path.join(postsDir, today + '-new-post.md'), frontMatter);


  },
  handleSettings: function() {

  },
  handleFrontMatter: function() {
    this.props.displayModal();
  },
  render: function() {
    if (this.props.editMode) {
      var frontMatter = <li onClick={this.handleFrontMatter}><span rel="tipsy" className="icon-yaml" title="Edit Front-matter"></span></li>;
      var publishLink = <li><span rel="tipsy" className="icon-publish" title="Publish to GitHub"></span></li>;
      var savingText = <li>{this.props.savingText}</li>;
    }
    var blogName = this.props.blogPath.split('/').slice(-1).toString();
    return (
      <div className="fixed">
        <nav className="top-bar">
          <section className="top-bar-section">
            <span onClick={this.handleBlogName} rel="tipsy" className="title" title={this.props.blogPath}>{blogName}</span>
            <ul className="left">
              <li onClick={this.handleNewPost}><span rel="tipsy" className="icon-new" title="New"></span></li>
              {frontMatter}
              {publishLink}
              {savingText}
            </ul>
            <ul className="right">
              <li onClick={this.handleSettings}><span rel="tipsy" className="icon-settings" title="Settings"></span></li>
              <li onClick={this.props.handleHome}><span rel="tipsy" className="icon-home" title="Home"></span></li>
              <li onClick={this.handleExit}><span rel="tipsy" className="icon-exit" title="Exit"></span></li>
            </ul>
          </section>
        </nav>
      </div>
    );
  }
});

var ModalDialog = React.createClass({
  hide: function() {
    $(this.getDOMNode()).foundation('reveal', 'close');
  },
  show: function() {
    $(this.getDOMNode()).foundation('reveal', 'open');
  },
  handleSubmit: function() {
    var data = {
      layout: this.refs.layout.getDOMNode().value,
      title: this.refs.title.getDOMNode().value,
      excerpt: this.refs.excerpt.getDOMNode().value,
      image: this.refs.image.getDOMNode().value
    };
    this.props.updateFrontMatter(data);
    this.hide();
    return false;
  },
  render: function() {
    if (this.props.frontMatter) {
      var frontMatter = yaml.load(this.props.frontMatter);
      return (
        <div className="reveal-modal" data-reveal>
          <form onSubmit={this.handleSubmit}>
            <label>Layout
              <input ref="layout" type="text" defaultValue={frontMatter.layout} />
            </label>
            <label>Title
              <input ref="title" type="text" defaultValue={frontMatter.title} />
            </label>
            <label>Excerpt
              <input ref="excerpt" type="text" defaultValue={frontMatter.excerpt} />
            </label>
            <label>Image
              <input ref="image" type="text" defaultValue={frontMatter.image} />
            </label>
            <button type="submit" className="small">Update</button>
          </form>
          <a className="close-reveal-modal">&#215;</a>
        </div>
        );
    } else {
      return <div></div>;
    }
  }
});

var NewPostDialog = React.createClass({
  hide: function() {
    $(this.getDOMNode()).foundation('reveal', 'close');
  },
  show: function() {
    $(this.getDOMNode()).foundation('reveal', 'open');
  },
  handleSubmit: function() {
    var data = {
      layout: this.refs.layout.getDOMNode().value,
      title: this.refs.title.getDOMNode().value,
      excerpt: this.refs.excerpt.getDOMNode().value,
      image: this.refs.image.getDOMNode().value
    };
    this.props.updateFrontMatter(data);
    this.hide();
    return false;
  },
  render: function() {
    if (this.props.frontMatter) {
      var frontMatter = yaml.load(this.props.frontMatter);
      return (
        <div className="reveal-modal" data-reveal>
          <form onSubmit={this.handleSubmit}>
            <label>Layout
              <input ref="layout" type="text" defaultValue={frontMatter.layout} />
            </label>
            <label>Title
              <input ref="title" type="text" defaultValue={frontMatter.title} />
            </label>
            <label>Excerpt
              <input ref="excerpt" type="text" defaultValue={frontMatter.excerpt} />
            </label>
            <label>Image
              <input ref="image" type="text" defaultValue={frontMatter.image} />
            </label>
            <button type="submit" className="small">Update</button>
          </form>
          <a className="close-reveal-modal">&#215;</a>
        </div>
        );
    } else {
      return <div></div>;
    }
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