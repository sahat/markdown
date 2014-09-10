/** @jsx React.DOM */

var Home = React.createClass({
  getInitialState: function() {
    return {
      savingText: '',
      blogBaseUrl: '',
      jekyllStatus: '',
      isLoading: false,
      frontMatter: null
    }
  },
  componentDidMount: function() {
    this.refs.fileDialog.getDOMNode().addEventListener('change', this.setBlogPath);
    this.refs.fileDialog.getDOMNode().setAttribute('nwdirectory', '');
  },
  componentDidUpdate: function() {
    if (this.props.blogDidLoad) {
      this.refs.myIframe.getDOMNode().addEventListener('load', this.iframeDidLoad, true);
    } else {
      this.refs.fileDialog.getDOMNode().addEventListener('change', this.setBlogPath);
      this.refs.fileDialog.getDOMNode().setAttribute('nwdirectory', '');
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
    this.setState({ isLoading: true });

    var loc = e.target.value.split(path.sep).join('/');
    this.props.setBlogPath(loc);
    var cmd = (process.platform === 'win32') ? 'jekyll.bat' : 'jekyll';
    var child = spawn(cmd, ['serve', '--watch', '-s', loc]);
    child.stdout.on('data', function (data) {
      var line = data.toString();
      this.setState({ jekyllStatus: line });
      console.log(line);
      var serverRunning = 'Server running...';
      var portInUse = (process.platform === 'win32') ? 'Only one usage of each socket address' : 'Address already in use';
      if (line.match(serverRunning) && line.match(serverRunning).length ||
        line.match(portInUse) && line.match(portInUse).length) {
        this.blogDidLoad(true);
        this.setState({ isLoading: false });
      }
    }.bind(this));

    process.on('exit', function() {
      child.kill();
    });

    this.handlesetPosts(loc);
  },
  handleSave: function() {
    var iframe = this.refs.myIframe.getDOMNode().contentWindow;
    var postsDir = path.join(this.props.blogPath, '_posts');
    var postSlug = iframe.location.pathname.replace(/\//g, '');
    var container = iframe.document.querySelector('.post-content');
    var markdown = md(container.innerHTML, { inline:true });
    markdown = markdown.replace('’', 'ZZZ');
    var self = this;
    _.each(this.props.posts, function(postFile) {
      if (postFile.match(postSlug)) {
        var file = fs.readFileSync(path.join(postsDir, postFile), 'utf8');
        var frontMatter = file.split('---').slice(0,2);
        if (self.state.frontMatter) {
          frontMatter[1] = self.state.frontMatter;
        } else {
          self.setState({ frontMatter: frontMatter[1] });
        }

        window.frontMatter = frontMatter;
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

    if (this.state.isLoading) {
      var loading = <div><span className="ion-loading-c"></span> Starting Jekyll Server...</div>;
    }
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
          <iframe ref="myIframe" src={this.props.url} width="100%" height="100%" frameBorder="0"></iframe>
        </div>
      );
    } else {
      return (
        <div className="home">
          <h1>Jekyll Blog Editor</h1>
          <button ref="openBlog" onClick={this.handleOpenBlog} className="outline">Open Blog</button>
          <input ref="fileDialog" type="file" className="hidden" />
          <h4 ref="subheading">Select a local Jekyll blog</h4>
          <h4>{loading}</h4>
        </div>
      );
    }
  }
});
