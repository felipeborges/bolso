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

        let builder = new Gtk.Builder();
        builder.add_from_resource('/gnome-pocket/headerbar.ui');

        let header_bar = builder.get_object('header');
        this.set_titlebar(header_bar);

        this.stack = new Gtk.Stack({
            transition_type: Gtk.StackTransitionType.CROSSFADE,
            transition_duration: 200,
            visible: true,
        });
        this.add(this.stack);

        let stack_switcher = builder.get_object('stack-switcher');
        stack_switcher.set_stack(this.stack);
        header_bar.set_custom_title(stack_switcher);

        let panels = [];

        panels.push(new Views.OverView(Articles.Collections.RECENT, 'Home', header_bar));
        panels.push(new Views.OverView(Articles.Collections.FAVORITES, 'Favorites', header_bar));
        panels.push(new Views.OverView(Articles.Collections.ARCHIVE, 'Archive', header_bar));

        panels.forEach(Lang.bind(this, function(view) {
            this.stack.add_titled(view.widget, view.title, view.title);
        }));

        let preview = new Views.Preview(header_bar);
        this.stack.add_named(preview.widget, "preview");

        Application.articles.connect('active-changed', Lang.bind(this, function() {
            this.stack.set_visible_child_name("preview");
        }));
    },

    _about: function() {
        let aboutDialog = new Gtk.AboutDialog(
            { authors: [ 'Felipe Borges <felipeborges@src.gnome.org>' ],
              translator_credits: _("translator-credits"),
              program_name: _("Pocket"),
              comments: _("Pocket for GNOME"),
              copyright: 'Copyright 2014 The Pocket developers',
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
