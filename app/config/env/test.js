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
		    'PHOTO_UPLOAD_COMPLETE': {
		    	'DEFAULT': {
			    	template: 'text',
			    	response_id: 'PHOTO_UPLOAD_COMPLETE',
			    	message: {
			    		text: "All done! We've added those photos to your order making a total of {{photo-count}} photos this month. Check your order at any time by logging in to your account at www.printwithpixy.com/login"
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
							'payload': {
								template_type: 'button',
								text: 'What do you want to do next?',
								buttons:[
								{
									type: 'web_url',
						    		url: 'http://www.printwithpixy.com/',
						    		title: 'Visit website'
								}]
							}
						}
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
						    		type: 'web_url',
						    		url: 'http://www.printwithpixy.com/contact',
						    		title: 'Via our website'
						    	},
						    	{
						    		type: 'web_url',
						    		url: 'mailto:help@printwithpixy.com?subject:Messenger%20problem%20%40mid%58{{messengerId}}%41',
						    		title: 'Email us'
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
								text:"Oops, looks like you're not a Pixy customer. To use Pixy, please signup at our website. Already a customer? You need to connect your account to Facebook Messenge first using the link below.",
								buttons:[
								{
						    		type: 'web_url',
						    		url: 'http://www.printwithpixy.com/choose-a-plan?mid={{messengerId}}',
						    		title: 'Signup'
						    	},
						    	{
						    		type: 'web_url',
						    		url: 'https://secure.printwithpixy.com/#/login?mid={{messengerId}}',
						    		title: 'Connect your account'
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