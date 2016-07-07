/**
 * Expose
 */

module.exports = {
    api: {
        version: '/v3'
    },
    stripe: {
        secretAccessKey: 'sk_test_KN8z6UJtLbBWITp7FZUGiWKI'
    },
    s3: {
        folder: 'user-images'
    },
    facebook: {
		api: '/v2.6',
		pageToken: 'CAANSeXKOXSwBANK1Rxgs8eyAzfKNtB1LYWtbiOEMPhBJOWl2lVH7T7z2JQLm2oMGMioZCGJWpvxZC0JOpGTzQZA0QOOg7RCcameZBUOUiGtGPgIC0Xs2vjqSU9RZCNQZCuVNpxkv0XHIcUokkvenhNFpGRfNn6idRKArWM1WwbUe20DzvZAvDT646VlF13FxxUq3uVZAG7ZAbSgZDZD',
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
										"1. Signup/Login to Pixy.\n" +
										"2. Send us your photos, right here in messenger.\n" +
										"3. We print & send your photos at the end of the month.\n" +
										"\n" +
										"To get started, choose an option below.\n" +
										"\n" +
										"Need help? Just text us MENU to see more options. :)",
								buttons:[
								{
						    		type: 'web_url',
						    		title: 'See our prices',
						    		url: 'http://www.printwithpixy.com/choose-a-plan'
						    	},
						    	{
						    		type: 'web_url',
						    		title: 'Signup',
						    		url: 'http://www.printwithpixy.com/choose-a-plan'
						    	},
						    	{
						    		type: 'web_url',
						    		title: 'Login',
						    		url: 'http://www.printwithpixy.com/login'
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
								text:"Hi there. To use Pixy, please signup or login to your Pixy account.\n" +
										"\n" +
										"* To upload photos, send them to us in this chat and we'll add them to your next order.\n" +
										"* Text us the word MENU at any time to see options.\n" +
										"* Need help, just text HELP and a real person will be in-touch (I'm just a friendly robot). :)\n",
								buttons:[
								{
						    		type: 'web_url',
						    		url: 'http://www.printwithpixy.com/choose-a-plan?mid={{messengerId}}',
						    		title: 'Signup'
						    	},
						    	{
						    		type: 'web_url',
						    		url: 'https://secure.printwithpixy.com/#/login?mid={{messengerId}}',
						    		title: 'Login'
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
						    		url: 'https://secure.printwithpixy.com/#/my-account?id={{userId}}',
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
						    		url: 'https://secure.printwithpixy.com/#/my-account?id={{userId}}',
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
						    		url: 'http://www.printwithpixy.com/faq/',
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
			    		text: "How can we help? I'll pass your message on to one of our Pixy team."
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
						    		url: 'http://www.printwithpixy.com/choose-a-plan?mid={{messengerId}}',
						    		title: 'Signup'
						    	},
						    	{
						    		type: 'web_url',
						    		url: 'https://secure.printwithpixy.com/#/login?mid={{messengerId}}',
						    		title: 'Login'
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
