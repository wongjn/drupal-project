/**
 * @file
 * In-memory cache for routes.
 */

/* eslint-disable no-console */

// In-memory cache for routes.
export default {
  /**
   * Route objects keyed by url pathname and search parameters.
   *
   * @var {object}
   */
  _data: {},
  /**
   * Adds a Route to the cache.
   *
   * @param {URL} url
   *   The url of the route.
   * @param {Route|Promise<Route>} route
   *   The route object.
   */
  set(url, route) {
    const key = `${url.pathname}${url.search}`;
    this._data[key] = route;

    if (route instanceof Promise) {
      route.then(data => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Cache promise resolved for ${key}.`);
        }

        this.set(url, data);
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Cache mutation', this._data);
    }
  },
  /**
   * Gets a Route from the cache.
   *
   * @param {URL} url
   *   The url of the route.
   * @return {Route|Promise<Route>|null} Route
   *   The route object from the cache or null if one does not exist.
   */
  get(url) {
    const key = `${url.pathname}${url.search}`;

    return key in this._data ? this._data[key] : null;
  },
};
