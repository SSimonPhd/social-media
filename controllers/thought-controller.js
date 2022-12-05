const { Thought, User } = require('../models');

const thoughtController = {
    // Gets all thoughts and reactions
    getAllThought(req, res) {
        Thought.find({})
            .populate({
                path: 'reactions',
                select: '-__v'
            })
            .select('-__v')
            .then(dbData => res.json(dbData))
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },

    // Get one thought and reactions
    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.thoughtId })
            .populate({
                path: 'reactions',
                select: '-__v'
            })
            .select('-__v')
            .then(dbData => {
                if (!dbData) {
                    res.status(404).json({ message: `No Thought found with this id` });
                    return;
                }
                res.json(dbData);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },

    // Add thought to user
    addThought({ params, body }, res) {
        Thought.create(body)
            .then(({ _id }) => { // _id is the thought id
                return User.findOneAndUpdate(
                    { _id: body.userId },
                    { $push: { thoughts: _id } },
                    { new: true }
                );
            })
            .then(dbData => {
                if (!dbData) {
                    res.status(404).json({ message: 'No user found with this id!' });
                    return;
                }
                res.json(dbData);
            })
            .catch(err => res.json(err));
    },

    // Update a thought
    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate({ _id: params.thoughtId }, body, { new: true, runValidators: true })
            .then(dbData => {
                if (!dbData) {
                    res.status(404).json({ message: 'No Thought found with this id!' });
                    return;
                }
                res.json(dbData);
            })
            .catch(err => res.json(err));
    },

    // Add a reaction to a thought
    addReaction({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $push: { reactions: body } },
            { new: true, runValidators: true }
        )
            .then(dbData => {
                if (!dbData) {
                    res.status(404).json({ message: 'No Thought found with this id!' });
                    return;
                }
                res.json(dbData);
            })
            .catch(err => res.json(err));
    },

    // Remove a thought from db by user id.
    removeThought({ params, body }, res) {
        Thought.findOneAndDelete({ _id: params.thoughtId })
            .then(deletedThought => {
                if (!deletedThought) {
                    return res.status(404).json({ message: 'No thought with this id!' });
                }
                res.json(deletedThought);
            })
            .catch(err => res.json(err));

    },

    // Remove a reaction from a thought
    removeReaction({ params }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { reactionId: params.reactionId } } },
            { new: true }
        )
            .then(dbData => res.json(dbData))
            .catch(err => res.json(err));
    },

    // Get all reactions for a specified thought
    getAllReactions({ params, body }, res) {
        Thought.findOne({ _id: params.thoughtId })
            .populate({
                path: 'reactions',
                select: '-__v'
            })
            .select('reactions -_id')
            .then(dbData => {
                if (!dbData) {
                    res.status(404).json({ message: 'No Thought found with this id!' });
                    return;
                }
                res.json(dbData);
            })
            .catch(err => res.json(err));
    },

};

module.exports = thoughtController;