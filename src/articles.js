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
const Lang = imports.lang;

const INT32_MAX = (2147483647);

const Item = new Lang.Class({
    Name: 'Item',
    Extends: GObject.Object,
    Properties: {
      'item_id': GObject.ParamSpec.int('item_id', 'Item ID',
          'Unique Article identifier',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          0, INT32_MAX, 0),
      'resolved_url': GObject.ParamSpec.string('resolved_url', 'Resolved URL',
          'The final url of the item.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          ''),
      'given_title': GObject.ParamSpec.string('given_title', 'Given Title',
          'The title that was saved along with the item.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          ''),
      'resolved_title': GObject.ParamSpec.string('resolved_title', 'Resolved Title',
          'The title that Pocket found for the item when it was parsed.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          ''),
      'favorite': GObject.ParamSpec.boolean('favorite', 'Favorite',
          'If the item is favorited.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          false),
      'status': GObject.ParamSpec.int('status', 'Status',
          '0, 1, 2 - 1 if the item is archived - 2 if the item should be deleted',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          0, 2, 0),
      'excerpt': GObject.ParamSpec.string('excerpt', 'Excerpt',
          'The first few lines of the item (articles only).',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          ''),
      'is_article': GObject.ParamSpec.boolean('is_article', 'Is Article',
          'if the item is an article.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          false),
      'has_image': GObject.ParamSpec.int('has_image', 'Has Image',
          '0, 1, or 2 - 1 if the item has images in it - 2 if the item is an image.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          0, 2, 0),
      'has_video': GObject.ParamSpec.int('has_video', 'Has Video',
          '0, 1, or 2 - 1 if the item has videos in it - 2 if the item is a video.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          0, 2, 0),
      'word_count': GObject.ParamSpec.int('word_count', 'Word Count',
          'How many words are in the article.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          0, INT32_MAX, 0),
      'tags': GObject.ParamSpec.string('tags', 'Tags',
          'A JSON object of the user tags associated with the item.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          ''),
      'authors': GObject.ParamSpec.string('tags', 'Tags',
          'A JSON object listing all of the authors associated with the item.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          ''),
      'images': GObject.ParamSpec.string('tags', 'Tags',
          'A JSON object listing all of the images associated with the item.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          ''),
      'videos': GObject.ParamSpec.string('tags', 'Tags',
          'A JSON object listing all of the videos associated with the item.',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTURCT,
          ''),
    },

    _init: function(item) {
        this.parent();

        this.populateFromJsonObject(item);
    },

    populateFromJsonObject: function(object) {
        for (let prop in object) {
            this[prop] = object[prop];
        }
    },

    getTitle: function() {
        if (this.resolved_title) {
            return this.resolved_title;
        }

        return this.given_title;
    },

    getDescription: function() {
        if (this.excerpt) {
            return this.excerpt;
        }

        if (this.resolved_url) {
            return this.resolved_url;
        }

        return "";
    },

    isArchived: function() {
        return ((this.status === "1") ? true : false);
    },

    isFavorite: function() {
        return ((this.favorite === "1") ? true : false);
    },

    open: function() {
        log("open");
    }
});
