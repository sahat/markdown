/** @jsx React.DOM */

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
