
/**
 * Escape the given `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};