// assume JSON where keys are integers (arrays) or strings (objects)
function jsonradial(object, parentkey) {
  var info = {};
  info.name = parentkey;
  for (var key in object) {
    if (typeof info.children === 'undefined') {
      info.children = [];
    }
    if (typeof object[key] === 'object') {
      info.children.push(jsonradial(object[key], key));
    }
  }
  return info;
}
