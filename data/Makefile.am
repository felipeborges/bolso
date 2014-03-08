# I chose to use recursive automake so I can use nobase_ and avoid
# 5 different directory declarations
SUBDIRS = icons

resource_files = $(shell $(GLIB_COMPILE_RESOURCES) --sourcedir=$(srcdir) --generate-dependencies $(srcdir)/gnome-pocket.data.gresource.xml)
gnome-pocket.data.gresource: gnome-pocket.data.gresource.xml $(resource_files)
	$(AM_V_GEN) $(GLIB_COMPILE_RESOURCES) --target=$@ --sourcedir=$(srcdir) $<

resourcedir = $(pkgdatadir)
resource_DATA = gnome-pocket.data.gresource

appsdir = $(datadir)/applications
apps_DATA = gnome-pocket.desktop

@INTLTOOL_DESKTOP_RULE@

gsettings_SCHEMAS = gnome-pocket.gschema.xml

@GSETTINGS_RULES@

appdatadir = $(datadir)/appdata
appdata_DATA = gnome-pocket.appdata.xml

@INTLTOOL_XML_RULE@

gnome-pocket.service: gnome-pocket.service.in
	$(AM_V_GEN) sed \
		-e "s|[@]pkgdatadir@|$(pkgdatadir)|g" \
		-e "s|[@]pkglibdir@|$(pkglibdir)|g" \
		-e "s|[@]bindir@|$(bindir)|g" \
		$< > $@

servicedir = $(datadir)/dbus-1/services
service_DATA = gnome-pocket.service

EXTRA_DIST = \
	gnome-pocket.desktop.in \
	gnome-pocket.service.in \
	gnome-pocket.data.gresource.xml \
	$(gsettings_SCHEMAS) \
	gnome-pocket.appdata.xml.in \
	$(resource_files)

CLEANFILES = \
	gnome-pocket.service \
	gnome-pocket.data.gresource \
	gnome-pocket.appdata.xml \
	$(apps_DATA) \
	*.valid \
	gschemas.compiled

# For uninstalled use
all-local:
	$(GLIB_COMPILE_SCHEMAS) $(builddir)

-include $(top_srcdir)/git.mk
