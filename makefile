build:
	@tsc render.ts --resolveJsonModule --target es5
	@browserify render.js -o script.js
	@uglifyjs script.js > script.min.js

package:
	@rm -r conway
	@mkdir conway
	@cp index.html conway/index.html
	@cp script.min.js conway/script.min.js

.PHONY: build
