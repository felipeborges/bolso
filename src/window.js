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

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const Params = imports.params;

const Application = imports.application;
const Articles = imports.articles;
const Toolbar = imports.toolbar;
const Util = imports.util;
const Views = imports.views;

const MainWindow = new Lang.Class({
    Name: 'MainWindow',
    Extends: Gtk.ApplicationWindow,

    _init: function(params) {
        params = Params.fill(params, { title: GLib.get_application_name(),
                                       default_width: 887,
                                       default_height: 640 });
        this.parent(params);

        this._searchActive = true;

        Util.initActions(this,
                         [{ name: 'about',
                            activate: this._about }]);

        this._toolbar = new Toolbar.Toolbar();
        let header_bar = this._toolbar.header_bar;
        this.set_titlebar(header_bar);

        let builder = new Gtk.Builder();
        builder.add_from_resource('/gnome-pocket/resources/main-window.ui');

        this.stack = builder.get_object('view-stack');
        this.add(this.stack);

        this._toolbar.stack_switcher.set_stack(this.stack);

        // restore header_bar switcher when not in preview mode
        this.stack.connect('notify::visible-child-name',
            Lang.bind(this, function(stack, childName) {
                if (this.stack.get_visible_child_name() !== "preview") {
                    this._toolbar.set_overview_mode();
                }
            }));

        let panels = [];

        panels[0] = new Views.OverView(Articles.Collections.RECENT, 'Home', this._toolbar);
        panels[1] = new Views.OverView(Articles.Collections.FAVORITES, 'Favorites', this._toolbar);
        panels[2] = new Views.OverView(Articles.Collections.ARCHIVE, 'Archive', this._toolbar);

        panels.forEach(Lang.bind(this, function(view) {
            this.stack.add_titled(view.widget, view.title, view.title);
        }));

        let preview = new Views.Preview(this._toolbar);
        this.stack.add_named(preview.widget, "preview");

        Application.articles.connect('active-changed',
            Lang.bind(this, function(articles, collection, item) {
                if (item !== null) {
                    this.stack.set_visible_child_name("preview");
                    return;
                }

                this.stack.set_visible_child(panels[collection].widget);
        }));
    },

    _about: function() {
        let aboutDialog = new Gtk.AboutDialog(
            { authors: [ 'Felipe Borges <felipeborges@src.gnome.org>' ],
              translator_credits: _("translator-credits"),
              program_name: _("Pocket"),
              comments: _("Pocket for GNOME"),
              copyright: 'Copyright 2014 The GNOME Pocket developers',
              license_type: Gtk.License.GPL_2_0,
              logo_icon_name: pkg.name,
              version: pkg.version,
              website: 'https://github.com/felipeborges/gnome-pocket',
              wrap_license: true,
              modal: true,
              transient_for: this
            });

        aboutDialog.show();
        aboutDialog.connect('response', function() {
            aboutDialog.destroy();
        });
    },
});
