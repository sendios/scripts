
export default class Cookie {
  static PREFIX = 'mf_';

  static get(name) {
    const matches = document.cookie.match(new RegExp(
      `(?:^|; )${Cookie.PREFIX}${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`,
    ));
    return matches ? decodeURIComponent(matches[1]) : void (0);
  }

  static set(name, value, options) {
    options = options || {};

    let expires = options.expires;
    if (typeof expires === 'number' && expires) {
      const d = new Date();
      d.setTime(d.getTime() + expires);
      expires = options.expires = d.toUTCString();
    } else if (expires && expires.toUTCString) {
      options.expires = expires.toUTCString();
    } else {
      const d = new Date();
      d.setTime(d.getTime() + 365 * 24 * 3600000);
      expires = options.expires = d.toUTCString();
    }

    value = encodeURIComponent(value);
    let updatedCookie = `${Cookie.PREFIX + name}=${value}`;

    for (const propName in options) {
      updatedCookie += `; ${propName}`;
      const propValue = options[propName];
      if (propValue !== true) {
        updatedCookie += `=${propValue}`;
      }
    }

    document.cookie = updatedCookie;
  }
}
