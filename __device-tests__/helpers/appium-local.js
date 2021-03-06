/**
 * @flow
 * @format
 * */

/**
 * External dependencies
 */
import childProcess from 'child_process';

// Spawns an appium process
export const start = ( localAppiumPort: number ) => new Promise < childProcess.ChildProcess > ( ( resolve, reject ) => {
	const appium = childProcess.spawn( 'appium', [
		'--port', localAppiumPort.toString(),
		'--log', './appium-out.log',
		'--log-no-colors',
		'--relaxed-security', // Needed for mobile:shell commend for text entry on Android
	] );

	let appiumOutputBuffer = '';
	let resolved = false;
	appium.stdout.on( 'data', ( data ) => {
		if ( ! resolved ) {
			appiumOutputBuffer += data.toString();
			if ( appiumOutputBuffer.indexOf( 'Appium REST http interface listener started' ) >= 0 ) {
				resolved = true;
				resolve( appium );
			}
		}
	} );

	appium.on( 'close', ( code ) => {
		if ( ! resolved ) {
			reject( new Error( `Appium process exited with code ${ code }` ) );
		}
	} );
} );

export const stop = async ( appium: ?childProcess.ChildProcess ) => {
	if ( ! appium ) {
		return;
	}
	await appium.kill( 'SIGINT' );
};

export default {
	start,
	stop,
};
