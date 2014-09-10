/** @jsx React.DOM */

var Topbar = React.createClass({
  componentDidMount: function() {
    $('li[rel=tipsy]').tipsy({ fade: true });
  },
  componentDidUpdate: function() {
    $('li[rel=tipsy]').tipsy({ fade: true });
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
      var frontMatter = (
        <li rel="tipsy" title="Edit Front-matter" onClick={this.handleFrontMatter}>
          <i className="ion-edit"></i>
        </li>
      );

      var publishLink = (
        <li rel="tipsy" title="Publish to GitHub">
          <i className="ion-ios7-cloud-upload"></i>
        </li>
      );

      var savingText = <li>{this.props.savingText}</li>;
    }
    var blogName = this.props.blogPath.split('/').slice(-1).toString();
    return (
      <div className="fixed">
        <nav className="top-bar">
          <section className="top-bar-section">
            <span onClick={this.handleBlogName} rel="tipsy" className="title" title={this.props.blogPath}>{blogName}</span>
            <ul className="left">
              <li rel="tipsy" title="New Post" onClick={this.handleNewPost}>
                <i className="ion-compose"></i>
              </li>
              {frontMatter}
              {publishLink}
              {savingText}
            </ul>
            <ul className="right">
              <li rel="tipsy" title="Settings" onClick={this.handleSettings}>
                <i className="ion-settings"></i>
              </li>
              <li rel="tipsy" title="Home" onClick={this.props.handleHome}>
                <i className="ion-home"></i>
              </li>
              <li rel="tipsy" title="Exit" onClick={this.handleExit}>
                <i className="ion-log-out"></i>
              </li>
            </ul>
          </section>
        </nav>
      </div>
    );
  }
});
