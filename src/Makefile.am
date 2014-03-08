nodist_bin_SCRIPTS = gnome-pocket
nodist_pkgdata_SCRIPTS = gnome-pocket

resource_files = $(shell $(GLIB_COMPILE_RESOURCES) --sourcedir=$(srcdir) --generate-dependencies $(srcdir)/gnome-pocket.src.gresource.xml)
gnome-pocket.src.gresource: gnome-pocket.src.gresource.xml $(resource_files)
	$(AM_V_GEN) $(GLIB_COMPILE_RESOURCES) --target=$@ --sourcedir=$(srcdir) $<

resourcedir = $(pkgdatadir)
resource_DATA = gnome-pocket.src.gresource

# Legacy, until we can depend on package.js provided by gjs
jsdir = $(pkgdatadir)
dist_js_DATA = package.js

gnome-pocket: gnome-pocket.in
	$(AM_V_GEN) sed \
		-e "s|[@]GJS@|$(GJS)|g" \
		-e "s|[@]PACKAGE_VERSION@|$(PACKAGE_VERSION)|g" \
		-e "s|[@]prefix@|$(prefix)|g" \
		-e "s|[@]libdir@|$(libdir)|g" \
		-e "s|[@]pkgdatadir@|$(pkgdatadir)|g" \
		$< > $@
	@chmod +x $@

gnome-pocket: gnome-pocket.in
	$(AM_V_GEN) sed \
		-e "s|[@]GJS@|$(GJS)|g" \
		-e "s|[@]PACKAGE_VERSION@|$(PACKAGE_VERSION)|g" \
		-e "s|[@]prefix@|$(prefix)|g" \
		-e "s|[@]libdir@|$(libdir)|g" \
		-e "s|[@]pkgdatadir@|$(pkgdatadir)|g" \
		$< > $@
	@chmod +x $@

EXTRA_DIST = \
	gnome-pocket.in \
	gnome-pocket.in \
	gnome-pocket.src.gresource.xml \
	$(resource_files)

CLEANFILES = \
	gnome-pocket \
	gnome-pocket \
	gnome-pocket.src.gresource

-include $(top_srcdir)/git.mk
