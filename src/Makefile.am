nodist_bin_SCRIPTS = bolso 
nodist_pkgdata_SCRIPTS = bolso

resource_files = $(shell $(GLIB_COMPILE_RESOURCES) --sourcedir=$(srcdir) --generate-dependencies $(srcdir)/bolso.src.gresource.xml)
bolso.src.gresource: bolso.src.gresource.xml $(resource_files)
	$(AM_V_GEN) $(GLIB_COMPILE_RESOURCES) --target=$@ --sourcedir=$(srcdir) $<

resourcedir = $(pkgdatadir)
resource_DATA = bolso.src.gresource

# Legacy, until we can depend on package.js provided by gjs
jsdir = $(pkgdatadir)
dist_js_DATA = package.js

bolso: bolso.in
	$(AM_V_GEN) sed \
		-e "s|[@]GJS@|$(GJS)|g" \
		-e "s|[@]PACKAGE_VERSION@|$(PACKAGE_VERSION)|g" \
		-e "s|[@]prefix@|$(prefix)|g" \
		-e "s|[@]libdir@|$(libdir)|g" \
		-e "s|[@]pkgdatadir@|$(pkgdatadir)|g" \
		$< > $@
	@chmod +x $@

bolso: bolso.in
	$(AM_V_GEN) sed \
		-e "s|[@]GJS@|$(GJS)|g" \
		-e "s|[@]PACKAGE_VERSION@|$(PACKAGE_VERSION)|g" \
		-e "s|[@]prefix@|$(prefix)|g" \
		-e "s|[@]libdir@|$(libdir)|g" \
		-e "s|[@]pkgdatadir@|$(pkgdatadir)|g" \
		$< > $@
	@chmod +x $@

EXTRA_DIST = \
	bolso.in \
	bolso.in \
	bolso.src.gresource.xml \
	$(resource_files)

CLEANFILES = \
	bolso \
	bolso \
	bolso.src.gresource

-include $(top_srcdir)/git.mk
