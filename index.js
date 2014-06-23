var async = require('async');
var loaderUtils = require('loader-utils');
var sweet = require('sweet.js');

module.exports = function(source) {
  this.async();

  var config = loaderUtils.parseQuery(this.query);
  var currentFile = loaderUtils.getRemainingRequest(this)

  async.map(
    config.modules || [],
    function(module, callback) {
      this.resolve(this.context, module, function(err, result) {
        if (err) {
          callback(err);
          return;
        }
        try {
          callback(null, sweet.loadNodeModule(process.cwd(), result));
        } catch (e) {
          var err = "Sweet.js compile error: " + e.description + " in " + currentFile + "(" + e.lineNumber + ":" + e.column + ")"
          console.log(err)
          this.callback(null, "throw new Error('" + err + "')", "")
        }
      }.bind(this));
    }.bind(this),
    function(err, results) {
      if (err) {
        this.callback(err);
        return;
      }
      config.modules = results;
      var result = sweet.compile(source, config);

      this.cacheable && this.cacheable();
      this.callback(null, result.code, result.sourceMap);
    }.bind(this)
  );
};