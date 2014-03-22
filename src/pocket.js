/*
 * Copyright (c) 2014 Felipe Borges <felipe10borges@gmail.com>.
 *
 * Gnome Pocket is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * Gnome Pocket is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with Gnome Documents; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 */

const GObject = imports.gi.GObject;
const Goa = imports.gi.Goa;
const Lang = imports.lang;
const Rest = imports.gi.Rest;

function authenticate(callback) {
    let client = Goa.Client.new_sync(null);
    let accounts = client.get_accounts();

    accounts.forEach(Lang.bind(this, function(obj) {
        if (!obj.get_account())
            return;

        let account = obj.get_account();
        if (account.provider_type !== "pocket") {
            return;
        }

        let oauth2 = obj.get_oauth2_based();
        let consumer_key = oauth2.client_id;
        oauth2.call_get_access_token(null, Lang.bind(this, function(src, res) {
            try {
                let [success, token] = oauth2.call_get_access_token_finish(res);
                callback(consumer_key, token);
            } catch (e) {
                callback(consumer_key);
                log(e);
            }
        }));
    }));
}

const PocketStatusCodes = {
    REQUEST_SUCCESSFUL: [ 200, _("Request was successful") ],
    INVALID_REQUEST: [ 400, _("Invalid request, please make sure you follow the documentation for proper syntax") ],
    AUTH_ERROR: [ 401, _("Problem authenticating the user") ],
    ACCESS_DENIED: [ 403, _("User was authenticated, but access denied due to lack of permission or rate limiting") ],
    SERVER_DOWN: [ 503, _("Pocket's sync server is down for scheduled maintenance.") ]
}

const Api = new Lang.Class({
    Name: 'Api',

    _init: function() {
        this.parent();

        this.proxy = Rest.Proxy.new("http://getpocket.com/", false);
    },

    set_credentials: function(consumer_key, access_token) {
        if (!consumer_key) {
            return PocketStatusCodes.AUTH_ERROR;
        }

        if (consumer_key && !access_token) {
            return PocketStatusCodes.ACCESS_DENIED;
        }

        this.consumer_key = consumer_key;
        this.access_token = access_token;

        return PocketStatusCodes.REQUEST_SUCCESSFUL;
    },

    _newCall: function() {
        let newCall = this.proxy.new_call();
        newCall.set_method("POST");
        newCall.add_param("consumer_key", this.consumer_key);
        newCall.add_param("access_token", this.access_token);
        newCall.add_param("detailType", "complete");

        return newCall;
    },

    add: function(url) {
        let addCall = this._newCall();
        addCall.set_function("v3/add");
        addCall.add_param("url", url);

        addCall.invoke_async();
    },

    retrieveAsync: function(action, value, count, callback) {
        let retrieveCall = this._newCall();
        retrieveCall.set_function("v3/get");

        retrieveCall.add_param("count", count.toString());
        if ((action !== null) && (value !== null)) {
            retrieveCall.add_param(action, value);
        }

        retrieveCall.invoke_async(null, Lang.bind(this, function(proxyCall) {
            try {
                let jsonResponse = JSON.parse(proxyCall.get_payload());
                if (jsonResponse['status']) {
                    callback(jsonResponse.list);
                } else {
                    callback(false);
                }
            } catch (e) {
                log(e + recentCall.get_status_message());
                callback(false);
            }
        }));
    },

    modifyAsync: function(action, item, callback) {
        let modifyCall = this._newCall();
        modifyCall.set_function("v3/send");

        modifyCall.add_param("actions", "[{ \"action\" : \"" + action + "\", \"item_id\" :" + item.item_id + "}]" );
        modifyCall.invoke_async(null, Lang.bind(this, function(proxyCall) {
            try {
                let jsonResponse = JSON.parse(proxyCall.get_payload());
                if (jsonResponse['action_results'] == "true") {
                    callback(true);
                } else {
                    callback(false);
                }
            } catch (e) {
                callback(false);
            }
        }));
    },
});
