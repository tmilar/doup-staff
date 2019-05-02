import {AsyncStorage} from 'react-native'
import {Constants} from 'expo'

import isJSON from '../util/isJSON';

// Read base URL from expo 'extra' constants.
const {manifest: {extra: {apiUrl}}} = Constants

/**
 * Manage base session headers for all services after user has logged in
 */
class RequestClient {

  /**
   * Sends a json request to server
   * @param url
   * @param requestOptions
   */
  sendRequest = async (url, requestOptions = {}) => {
    const requestUrl = apiUrl + url

    let request = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    await this._attachRequestTokenHeader(request);
    if (requestOptions.body) {
      this._ensureBodyStringified(requestOptions);
    }
    if (requestOptions.method === 'POST') {
      this._ensureBodyPresent(requestOptions);
    }
    request = Object.assign(request, requestOptions);
    let rawResponse
    try {
      rawResponse = await fetch(requestUrl, request);
    } catch (error) {
      console.error("Request fetch error: ", error)
      throw error
    }
    console.log(request.method, url, rawResponse.status)
    let responseBody = await this._parseResponse(rawResponse);
    await this._checkResponseStatus(rawResponse, responseBody);
    return responseBody;
  }

  getMultipartFormData = async (url, requestOptions) => {
    return this._sendMultipartFormDataRequest('GET', url, requestOptions)
  }

  postMultipartFormData = async (url, requestOptions) => {
    return this._sendMultipartFormDataRequest('POST', url, requestOptions)
  }

  /**
   * Sends a multipart/form-data request
   *
   * @param verb
   * @param url
   * @param requestOptions
   * @returns {Promise<Response>}
   * @private
   */
  _sendMultipartFormDataRequest = async (verb, url, requestOptions = {}) => {
    url = apiUrl + url;
    let request = {
      method: verb,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    };
    request = Object.assign(request, requestOptions);
    await this._attachRequestTokenHeader(request);
    let rawResponse = await fetch(url, request);
    await this._checkResponseStatus(rawResponse);
    return rawResponse;
  }

  /**
   * Attachs session headers to request and returns it
   * @param request
   * @private
   */
  _attachRequestTokenHeader = async request => {
    let token  = await AsyncStorage.getItem('userToken');
    let sessionHeaders = {
      'x-access-token': token
    };
    let finalHeaders = request.headers || {};
    finalHeaders = Object.assign(sessionHeaders, finalHeaders);
    request.headers = finalHeaders;
  }


  /**
   * Useful to save the need of always stringifying manually the body.
   * @param requestOptions
   * @private
   */
  _ensureBodyStringified = (requestOptions) => {
    try {
      JSON.parse(requestOptions.body);
      // > is stringified. do nothing.
    } catch (e) {
      // > was not. do stringify.
      requestOptions.body = JSON.stringify(requestOptions.body);
    }
  };

  /**
   * Useful when we need at least an empty body
   * @param requestOptions
   * @private
   */
  _ensureBodyPresent = (requestOptions) => {
    if (!requestOptions.body) {
      requestOptions.body = JSON.stringify({});
    }
  };

  /**
   *
   * @param rawResponse
   * @returns {Promise<{}>}
   * @private
   */
  _parseResponse = async (rawResponse) => {
    try {
      return await this._parseJSON(rawResponse);
    } catch (e) {
      console.error("Invalid server raw response", e);
      throw 'Ocurrió un problema en la comunicación con el servidor.'
    }
  }


  /**
   * Parse response body to always return a valid JS object,
   * even if body is null or empty ("{}").
   *
   * @param response
   * @returns {Promise.<{}>}
   * @private
   */
  _parseJSON = async (response) => {
    let text = await response.text();
    let parsed = isJSON(text) ? JSON.parse(text) : null;
    return parsed;
  };

  /**
   *
   * @param rawResponse
   * @param responseBody
   * @returns {Promise<void>}
   * @private
   */
  _checkResponseStatus = async (rawResponse, responseBody) => {
    let status = rawResponse.status;
    if (status < 200 || status >= 300) {
      console.log(`Something unexpected did happen (status: ${status}). Raw response: \n`, rawResponse);

      if (status === 403) {
        throw 'El servidor no está disponible. Por favor, vuelva a intentar más tarde :(';
      }

      if (status === 401) {
        let defaultMsg = 'La sesión ha caducado. Por favor, vuelva a iniciar sesión.';
        throw {message: defaultMsg, status, responseBody};
      }

      if (status === 400) {
        let responseJSON = responseBody && JSON.stringify(responseBody) || "";
        console.log(`Error 400: bad request. Respuesta obtenida: ${responseJSON} `);
        throw {message: 'La solicitud es inválida.', status, responseBody};
      }
      throw 'Ha ocurrido un error. (status: ' + status + ').';

    }
  }
}

let client = new RequestClient();
export default client;
