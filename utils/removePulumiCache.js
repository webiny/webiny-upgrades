const fs = require("fs");
const path = require("path");
const { log } = require("./log");

const pulumiCliCachePath = `.webiny/pulumi-cli`;


const logToRemove = () => {
	log.error(`Cannot automatically remove Pulumi CLI cache, please do it manually.`);
	log.info(`Directory to remove: $YOUR_PROJECT_ROOT/${pulumiCliCachePath}`);
}

module.exports = async(context) => {
	if (!context.project || !context.project.root) {
		log.error("Missing definition for project root directory.");
		logToRemove();
		return;
	}
	
	log.info(`Removing Pulumi CLI cache directory...`)
	const target = path.join(context.project.root, pulumiCliCachePath);
	if (fs.existsSync(target) !== true) {
		log.error(`Missing directory "${pulumiCliCachePath}" in your project root.`);
		logToRemove();
		return;
	}
	
	const renamedTarget = `${pulumiCliCachePath}.${Date.now()}`;
	
	const renamedTargetPath = path.join(context.project.root, renamedTarget);
	
	try {
		fs.renameSync(target, renamedTargetPath);
	} catch(ex) {
		log.error(ex.message);
		logToRemove();
		
		return;
	}
	log.info("Successfully remove Pulumi CLI cache directory.");
};