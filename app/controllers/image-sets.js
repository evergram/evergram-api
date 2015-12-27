/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var _ = require('lodash');
var common = require('evergram-common');
var logger = common.utils.logger;
var printManager = common.print.manager;
var userManager = common.user.manager;
var User = common.models.User;
var ImageSets = common.models.printableImageSet;
var Image = common.models.Image;

/**
 * Module dependencies.
 */

var ImageSetController = function() {
    //constructor does nothing
};

/**
 * Serializes printableImageSet models for a response.
 *
 * @param imageSet
 * @returns {imageSet}
 */
function serialize(imageSet) {
    var serializedImageSet = imageSet;
    delete serializedImageSet.isReadyForPrint;
    delete serializedImageSet.isPaid;
    delete serializedImageSet.inQueue;

    return serializedImageSet;
}

/**
 * Gets all imagesets.
 * Returned in decending order by period
 *
 * @param req
 * @param res
 */
ImageSetController.prototype.getAll = function(req, res) {

    logger.info('Getting ImageSets for user ' + req.params.userid);
    
    getUser(req.params.userid).
    then(function(user) {

        return printManager.findAllByUser(user);

    }).
    then(function(imageSets) {

        logger.info('Found ' + imageSets.length + ' image sets');
        var serializedImageSets = [];
        _.forEach(imageSets, function(imageSet) {
            serializedImageSets.push(serialize(imageSet));
        });
        res.json(serializedImageSets);
    }).
    fail(function(err) {
        logger.error('Error getting imageSets', err);
        res.status(400).send(err.message);
    });
};

/**
 * Gets the most recent imageset.
 *
 * @param req
 * @param res
 */
ImageSetController.prototype.getCurrent = function(req, res) {

    
    logger.info('Getting current Image set for user ' + req.params.userid);
    
    getUser(req.params.userid).
    then(function(user) {

        return printManager.findCurrentByUser(user);

    }).
    then(function(imageset) {

        if (!!imageset) {
            logger.info('Found ImageSet ' + imageset.id);
            res.json(serialize(imageset));
        } else {
            logger.error('Error: Latest ImageSet for user ' + req.params.userid + ' not found');
            res.status(404).send('ImageSet does not exist');
        }
    }).
    fail(function(err) {
        logger.error('Error getting current imageset', err);
        res.status(400).send(err.message);
    });
};

/**
 * Gets a single imageset.
 *
 * @param req
 * @param res
 */
ImageSetController.prototype.getById = function(req, res) {

    logger.info('Getting Image set ' + req.params.id + ' for user ' + req.params.userid);

    printManager.find({
        criteria: { 
            _id : req.params.id
        }
    }).
    then(function(imageset) {
        
        if (!!imageset) {
            logger.info('Found ImageSet ' + imageset.id);
            res.json(serialize(imageset));
        } else {
            logger.error('Error: ImageSet ' + req.params.id + ' not found');
            res.status(404).send('ImageSet does not exist');
        }
    }).
    fail(function(err) {
        logger.error('Error getting image set with id ' + req.params.id, err)
        res.status(400).send(err.message);
    });
};

/**
 * Gets the user from the database.
 *
 * @param id
 * @returns {*}
 */
function getUser(id) {

    return userManager.findById(id).
        then(function(user) {

            if (user !== null) {
                logger.info('Successfully found the image set user: ' + user._id);
                return user;
            } else {
                throw 'Could not find a user for the id :' + id;
            }
        });
}

/**
 * Expose
 * @type {ImageSetController}
 */
module.exports = exports = new ImageSetController();
