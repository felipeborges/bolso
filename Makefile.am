ACLOCAL_AMFLAGS = -I m4

SUBDIRS = po data src

MAINTAINERCLEANFILES = \
	$(srcdir)/INSTALL \
	$(srcdir)/aclocal.m4 \
	$(srcdir)/autoscan.log \
	$(srcdir)/compile \
	$(srcdir)/config.guess \
	$(srcdir)/config.h.in \
	$(srcdir)/config.sub \
	$(srcdir)/configure.scan \
	$(srcdir)/depcomp \
	$(srcdir)/install-sh \
	$(srcdir)/ltmain.sh \
	$(srcdir)/missing \
	$(srcdir)/mkinstalldirs

GITIGNOREFILES = .anjuta .anjuta_sym_db.db m4/ rpms/

distdir = bolso-$(VERSION)

rpmdefines = \
	--define "_name bolso" \
	--define "_version $(PACKAGE_VERSION)" \
	--define "_distdir bolso" \
	--define "_sourcedir $(abs_builddir)" \
	--define "_specdir $(abs_srcdir)" \
	--define "_builddir $(abs_builddir)/rpms" \
	--define "_srcrpmdir $(abs_builddir)/rpms" \
	--define "_rpmdir $(abs_builddir)/rpms"

rpm: dist
	@rm -fR $(builddir)/rpms
	@mkdir $(builddir)/rpms
	env -i PATH=/usr/bin/:/bin SHELL=$(SHELL) HOSTNAME=$${HOSTNAME} HOME=$${HOME} \
	rpmbuild $(rpmdefines) -ba $(srcdir)/bolso.spec

clean-local:
	rm -fR $(builddir)/rpms

EXTRA_DIST = bolso.spec

include $(top_srcdir)/git.mk
