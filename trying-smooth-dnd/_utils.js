const isArray = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

export function getTagProps (ctx, tagClasses) {
  const tag = ctx.$props.tag;
  if (!tag)
    return { value: 'div' };
  
  if (typeof tag === 'string') {
    const result = { value: tag, props: { class: tagClasses || []} };
    return result;
  }
  
  if (typeof tag === 'object') {
    const result = { value: tag.value || 'div', props: tag.props || {} };

    if (tagClasses) {
      if (result.props.class) {
        isArray(result.props.class)
        ? (result.props.class.push(tagClasses))
        : (result.props.class = [tagClasses, result.props.class]);
      }
      else result.props.class = tagClasses;
    }

    return result;
  }
}

export function validateTagProp (tag) {
  if (!tag) return true;

  return typeof tag === "string" || ["string","function","object"].includes(typeof tag.value);
}
