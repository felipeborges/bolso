# I chose to use recursive automake so I can use nobase_ and avoid
# 5 different directory declarations
SUBDIRS = icons

resource_files = $(shell $(GLIB_COMPILE_RESOURCES) --sourcedir=$(srcdir) --generate-dependencies $(srcdir)/bolso.data.gresource.xml)
bolso.data.gresource: bolso.data.gresource.xml $(resource_files)
	$(AM_V_GEN) $(GLIB_COMPILE_RESOURCES) --target=$@ --sourcedir=$(srcdir) $<

resourcedir = $(pkgdatadir)
resource_DATA = bolso.data.gresource

appsdir = $(datadir)/applications
apps_DATA = bolso.desktop

@INTLTOOL_DESKTOP_RULE@

gsettings_SCHEMAS = bolso.gschema.xml

@GSETTINGS_RULES@

appdatadir = $(datadir)/appdata
appdata_DATA = bolso.appdata.xml

@INTLTOOL_XML_RULE@

bolso.service: bolso.service.in
	$(AM_V_GEN) sed \
		-e "s|[@]pkgdatadir@|$(pkgdatadir)|g" \
		-e "s|[@]pkglibdir@|$(pkglibdir)|g" \
		-e "s|[@]bindir@|$(bindir)|g" \
		$< > $@

servicedir = $(datadir)/dbus-1/services
service_DATA = bolso.service

EXTRA_DIST = \
	bolso.desktop.in \
	bolso.service.in \
	bolso.data.gresource.xml \
	$(gsettings_SCHEMAS) \
	bolso.appdata.xml.in \
	$(resource_files)

CLEANFILES = \
	bolso.service \
	bolso.data.gresource \
	bolso.appdata.xml \
	$(apps_DATA) \
	*.valid \
	gschemas.compiled

# For uninstalled use
all-local:
	$(GLIB_COMPILE_SCHEMAS) $(builddir)

-include $(top_srcdir)/git.mk
