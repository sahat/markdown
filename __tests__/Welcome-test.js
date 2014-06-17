/** @jsx React.DOM */

var React = require('react/addons');

jest.dontMock('../app.js');

describe('CheckboxWithLabel', function() {
  it('changes the text after click', function() {
    var React = require('react/addons');
    var CheckboxWithLabel = require('../app.js');
    var TestUtils = React.addons.TestUtils;

    // Render a checkbox with label in the document
    var checkbox = <Welcome />;
    TestUtils.renderIntoDocument(checkbox);

    // Verify that it's Off by default
    var label = TestUtils.findRenderedDOMComponentWithTag(
      checkbox, 'label');
    expect(label.getDOMNode().textContent).toEqual('Off');

    // Simulate a click and verify that it is now On
    var input = TestUtils.findRenderedDOMComponentWithTag(
      checkbox, 'input');
    TestUtils.Simulate.change(input);
    expect(label.getDOMNode().textContent).toEqual('On');
  });
});
