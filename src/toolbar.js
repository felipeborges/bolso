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
 
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Application = imports.application;
const Articles = imports.articles;

const Toolbar = new Lang.Class({
    Name: 'Toolbar',

    _init: function() {
        let builder = new Gtk.Builder();
        builder.add_from_resource('/bolso/resources/main-window.ui');

        this.header_bar = builder.get_object('header-bar');

        this.stack_switcher = builder.get_object('stack-switcher');
        this.header_bar.set_custom_title(this.stack_switcher);

        this._backButton = builder.get_object('back-button');
        this._backButton.connect('clicked', 
            Lang.bind(this, this._onBackButtonClicked));

        this._previewActionsButton = builder.get_object('preview-actions-button');
        this._actionsPopover = builder.get_object('preview-action-buttons');
        this._actionsPopover.set_relative_to(this._previewActionsButton);
        this._previewActionsButton.connect('toggled', Lang.bind(this, function() {
            this._actionsPopover.show();
        }));

        // preview action buttons
        this._archiveButton = builder.get_object('archive-button');
        this._deleteButton = builder.get_object('delete-button');
        this._favoriteButton = builder.get_object('favorite-button');
    },

    _onBackButtonClicked: function() {
        Application.articles.setActiveItem(activeCollection, null);
    },

    _onArchiveButtonToggled: function() {
        let activeItem = Application.articles.getActiveItem();

        if (activeItem.isArchived()) {
            Application.articles.unarchiveItem(activeItem);
            return;
        }

        Application.articles.archiveItem(activeItem);

        // Go back to overview
        Application.articles.setActiveItem(activeCollection, null);
    },

    _onDeleteButtonClicked: function() {
        let activeCollection = Application.articles.getActiveCollection();
        let activeItem = Application.articles.getActiveItem();

        Application.articles.removeItem(activeCollection, activeItem);

        // Go back to overview
        Application.articles.setActiveItem(activeCollection, null);
    },

    _onFavoriteButtonToggled: function() {
        let activeCollection = Application.articles.getActiveCollection();
        let activeItem = Application.articles.getActiveItem();

        if (activeItem.isFavorite()) {
            // unfavorite
            return;
        }

        Application.articles.favoriteItem(activeCollection, activeItem);
    },

    _setActionButtonsState: function() {
        let activeItem = Application.articles.getActiveItem();

        if (activeItem.isArchived()) {
            this._archiveButton.active = true;
        }

        if (activeItem.isFavorite()) {
            this._favoriteButton.active = true;
        }

        this._archiveButton.connect('toggled', Lang.bind(this, this._onArchiveButtonToggled));
        this._favoriteButton.connect('toggled', Lang.bind(this, this._onFavoriteButtonToggled));
        this._deleteButton.connect('clicked', Lang.bind(this, this._onDeleteButtonClicked));
    },

    set_overview_mode: function() {
        this.header_bar.set_custom_title(this.stack_switcher);

        this._backButton.hide();
        this._previewActionsButton.hide();
    },

    set_preview_mode: function() {
        this.header_bar.set_custom_title(null);
        this.header_bar.set_title(Application.articles.getActiveItem().given_title);

        this._setActionButtonsState();

        this._backButton.show();
        this._previewActionsButton.show();
        this._previewActionsButton.active = false;
    }
 })
