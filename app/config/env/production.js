/**
 * Expose
 */

module.exports = {
    api: {
        version: process.env.API_VERSION || '/v3'
    },
    stripe: {
        secretAccessKey: process.env.STRIPE_SECRET_ACCESS_KEY
    },
    s3: {
        folder: 'user-images'
    },
    facebook: {
		api: '/v2.6',
		pageId: process.env.FACEBOOK_PAGE_ID,
		pageToken: process.env.FACEBOOK_PAGE_TOKEN,
	    messengerResponses: {
	    	'GET_STARTED': {
	    		'DEFAULT': {
			    	template: 'button',
			    	response_id: 'GET_STARTED',
			    	message: {
			    		attachment: {
							type:'template',
							payload: {
								template_type:'button',
								text:"Welcome to Pixy, the easiest way to print your photos.\n" +
										"\n" +
										"How Pixy works:\n" +
										"1. Signup/Connect your Pixy account.\n" +
										"2. Send us your photos, right here in messenger.\n" +
										"3. We print & send your photos at the end of the month.\n" +
										"\n" +
										"To get started, choose an option below.\n" +
										"\n" +
										"Need help? Just text us MENU to see more options. :)",
								buttons:[
								{
						    		type: 'web_url',
						    		title: 'Find out more',
						    		url: process.env.PRODUCTION_SITE_URL + '/?mid={{messengerId}}'
						    	},
						    	{
						    		type: 'web_url',
						    		title: 'See our prices',
						    		url: process.env.PRODUCTION_SITE_URL + '/choose-a-plan?mid={{messengerId}}'
						    	},
						    	{
						    		type: 'web_url',
						    		title: 'Signup',
						    		url: process.env.PRODUCTION_SITE_URL + '/choose-a-plan?mid={{messengerId}}'
						    	},
						    	{
						    		type: 'web_url',
						    		title: 'Connect your account',
						    		url: process.env.PRODUCTION_SECURE_SITE_URL + '/connect?mid={{messengerId}}'
						    	}]
							}
						}
				    }
			    }
			},
			'MENU': {
				'DEFAULT': {
			    	template: 'button',
			    	response_id: 'MENU.LOGGED_OUT',
			    	message: {
			    		attachment: {
							type:'template',
							payload: {
								template_type:'button',
								text:"Hi there. To use Pixy, please signup or connect to your Pixy account.\n" +
										"\n" +
										"* To upload photos, send them to us in this chat and we'll add them to your next order.\n" +
										"* Text us the word MENU at any time to see options.\n" +
										"* Need help, just text HELP and a real person will be in-touch (I'm just a friendly robot). :)\n",
								buttons:[
								{
						    		type: 'web_url',
						    		url: process.env.PRODUCTION_SITE_URL + '/choose-a-plan?mid={{messengerId}}',
						    		title: 'Signup'
						    	},
						    	{
						    		type: 'web_url',
						    		url: process.env.PRODUCTION_SECURE_SITE_URL + '/connect?service=messenger&mid={{messengerId}}',
						    		title: 'Connect your account'
						    	},
						    	{
						    		type: 'postback',
						    		payload: 'HELP',
						    		title: 'Get help'
						    	}]
							}
						}
				    }
			    },
				'LOGGED_IN': {
			    	template: 'button',
			    	response_id: 'MENU.LOGGED_IN',
			    	message: {
			    		attachment: {
							type:'template',
							payload: {
								template_type:'button',
								text:"Great work {{firstName}}! Your Pixy account is now connected to Messenger.\n" +
										"\n" +
										"* To upload photos, send them to us in this chat and we'll add them to your next order.\n" +
										"* Text us the word MENU at any time to see options.\n" +
										"* Need help, just text HELP and a real person will be in-touch (I'm just a friendly robot). :)\n",
								buttons:[
								{
						    		type: 'postback',
						    		payload: 'PHOTO_UPLOAD.START',
						    		title: 'Upload photos'
						    	},
						    	{
						    		type: 'web_url',
						    		url: process.env.PRODUCTION_SECURE_SITE_URL + '/#/my-account?id={{userId}}',
						    		title: 'View your order'
						    	},
						    	{
						    		type: 'postback',
						    		payload: 'HELP',
						    		title: 'Get help'
						    	}]
							}
						}
				    }
			    }
	    	},
		    'PHOTO_UPLOAD': {
		    	'DEFAULT': {
			    	template: 'text',
			    	response_id: 'PHOTO_UPLOAD.START',
			    	message: {
			    		text: "Go for it. We're ready... :)\n" +
			    				"\n" +
			    				"P.S we're always ready. You can message photos to us at anytime."
			    	}
			    },
		    	'COMPLETE': {
			    	template: 'button',
			    	response_id: 'PHOTO_UPLOAD.COMPLETE',
			    	message: {
			    		attachment: {
							type:'template',
							payload: {
								template_type:'button',
								text:'All done! Your order now has {{photo-count}} photos.',
								buttons:[
								{
						    		type: 'postback',
						    		payload: 'PHOTO_UPLOAD.START',
						    		title: 'Upload more photos'
						    	},
						    	{
						    		type: 'web_url',
						    		url: process.env.PRODUCTION_SECURE_SITE_URL + '/#/my-account?id={{userId}}',
						    		title: 'View your order'
						    	}]
							}
						}
				    }
			    }
			},
			'HELP': {
		    	'DEFAULT': {
			    	template: 'button',
			    	response_id: 'HELP',
			    	message: {
			    		attachment: {
							type:'template',
							payload: {
								template_type:'button',
								text:"Pixy Help:\n" +
										"* To upload photos, simply send them to us at any time in this chat and we'll add them to your next order.\n" +
										"* To see the menu text us the word MENU.\n" +
										"\n" +
										"Need something else? Tap 'Ask a question' below to talk to a Pixy Team member (I'm just a friendly robot). :)",
								buttons:[
								{
						    		type: 'web_url',
						    		url: process.env.PRODUCTION_SITE_URL + '/faq/',
						    		title: 'See our online Help'
						    	},
								{
						    		type: 'postback',
						    		payload: 'HELP.REQUEST',
						    		title: 'Ask a question'
						    	}]
							}
						}
				    }
			    },
		    	'REQUEST': {
			    	template: 'text',
			    	response_id: 'HELP.REQUEST',
			    	message: {
			    		text: "Need some help? No problem. Just send an email to help@printwithpixy.com for assistance from one of our friendly Pixy staff."
					}
			    },
		    	'REQUEST_SENT': {
			    	template: 'text',
			    	response_id: 'HELP.REQUEST_SENT',
			    	message: {
			    		text: "Ok, got it. I've sent this on to the Pixy team. One of them will reply to you shortly right here in Messenger. PS. No need to stick around... you'll get a notification when they reply."
					}
			    }
		    },
		    'ERROR': {
		    	'DEFAULT': {
			    	template: 'button',
			    	response_id: 'ERROR',
			    	message: {
			    		attachment: {
							type:'template',
							payload: {
								template_type:'button',
								text:'Oops, looks like something went wrong. Need some help? Get in-touch.',
								buttons:[								
								{
						    		type: 'postback',
						    		payload: 'HELP',
						    		title: 'Get help'
						    	}]
							}
						}
				    }
			    },
			    'USER_NOT_FOUND': {
			    	template: 'button',
			    	response_id: 'ERROR.USER_NOT_FOUND',
			    	message: {
			    		attachment: {
							type:'template',
							payload: {
								template_type:'button',
								text:"Oops, looks like you're not a Pixy customer. To use Pixy, please signup at our website. Already a customer? Login with your Pixy account below.",
								buttons:[
								{
						    		type: 'web_url',
						    		url: process.env.PRODUCTION_SITE_URL + '/choose-a-plan?mid={{messengerId}}',
						    		title: 'Signup'
						    	},
						    	{
						    		type: 'web_url',
						    		url: process.env.PRODUCTION_SECURE_SITE_URL + '/connect?service=messenger&mid={{messengerId}}',
						    		title: 'Connect your Pixy account'
						    	}]
							}
						}
				    }
			    },
		    	'UPLOAD_FAILED': {
			    	template: 'text',
			    	response_id: 'ERROR.UPLOAD_FAILED',
			    	message: {
			    		text: "Oh no! Something went wrong with the upload. Please try again. If this happens a lot check your internet hasn't dropped out or contact us for help."
			    	}
			    }
		    }
    	}
    }
};
