const assert = require('assert');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { exec } = require('child_process');

const cleanDist = () => {
	rimraf.sync(path.join(__dirname, '../packages/demo/dist-custom-dir'));
};

cleanDist();

describe('Build', () => {
	before(function(done) {
		this.timeout(6000);

		const child = exec('npm run build', {
			cwd: path.resolve(__dirname, '../packages/demo'),
		});
		// child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stderr);
		child.on('exit', () => {
			done();
		});
	});

	const checkBuild = ({ entry, entryTokens}) => {
		describe(entry, () => {
			const entryPath = path.join(__dirname, '../packages/demo/dist-custom-dir', entry);

			it('should be included in artefact', done => {
				fs.access(entryPath, fs.constants.R_OK, err => {
					assert.strictEqual(err, null);
					done();
				});
			});

			let data;
			before(done => {
				fs.readFile(entryPath, { encoding: 'utf8' }, (err, d) => {
					if (err) {
						done(err);
					} else {
						data = d;
						done();
					}
				});
			});

			entryTokens.forEach(token => {
				it(`should contain text "${token}"`, () => {
					assert.notStrictEqual(data.indexOf(token), -1);
				});
			});

		});
	};

	checkBuild({
		entry: 'main.bundle.js',
		entryTokens: ['Bonjour', 'Hola'],
	});

	describe('include.js', () => {
		it('should not be included in artefact', done => {
			fs.access(path.join(__dirname, '../packages/demo/dist-custom-dir', 'include.js'), fs.constants.R_OK, err => {
				assert.notEqual(err, null);
				done();
			});
		});
	});

	checkBuild({
		entry: 'main.css',
		entryTokens: ['background:red', 'text-decoration', ':-ms-input-placeholder{color:gray}'],
	});

	describe('import.css', () => {
		it('should not be included in artefact', done => {
			fs.access(path.join(__dirname, '../packages/demo/dist-custom-dir', 'import.css'), fs.constants.R_OK, err => {
				assert.notEqual(err, null);
				done();
			});
		});
	});
});
