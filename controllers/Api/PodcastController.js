const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Validator } = require('node-input-validator');
const modelName = 'songs';

module.exports = {
    list: async (req, res) => {
		try {
            let isLikeQuery = `ifnull((select is_love from loved_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let isBuyQuery = `ifnull((select count(id) from buy_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let recently_played_time = `ifnull((select updated_at from user_actions where user_id=${req.user.id} AND song_id=songs.id AND type='1' ),'0000-00-00 00:00:00')`;

            // let get_most_buy_song_list = await helper.getBuySongListGroupBy('song_id')
            let get_most_share_song_list = await helper.getMyRecentPlayedList('song_id',req.user.id,'3')
            let share_song_ids = get_most_share_song_list.length > 0 ? await helper.getSongIdArray(get_most_share_song_list,'song_id') : []

            let whereConditionForTop10Songs = {}
            if([share_song_ids].length > 0){
                whereConditionForTop10Songs.id = share_song_ids
            }

            let get_trending_song_list = await helper.getTrendingSongListGroupBy('song_id')
            let trending_song_ids = get_trending_song_list.length > 0 ? await helper.getSongIdArray(get_trending_song_list,'song_id') : []

            let whereConditionForTrendingSongs = {}
            if([trending_song_ids].length > 0){
                whereConditionForTrendingSongs.id = trending_song_ids
            }

            let get_my_action_song_list = await helper.getMySongActionList('song_id',req.user.id)
            let my_action_song_ids = get_my_action_song_list.length > 0 ? await helper.getSongIdArray(get_my_action_song_list,'song_id') : []
            
            let get_my_love_song_list = await helper.getMyLoveSongList(req.user.id)
            let my_love_song_ids = get_my_love_song_list.length > 0 ? await helper.getSongIdArray(get_my_love_song_list,'song_id') : []
            
            let get_my_buy_song_list = await helper.getMyBuySongList(req.user.id)
            let my_buy_song_ids = get_my_buy_song_list.length > 0 ? await helper.getSongIdArray(get_my_buy_song_list,'song_id') : []

            
            let my_song_ids = [...my_action_song_ids,...my_love_song_ids,...my_buy_song_ids]

            let uniqueSongIds = [...new Set(my_song_ids)]
            // console.log('================',uniqueSongIds);
            
            let whereConditionForMyActionSong = {}
            if([uniqueSongIds].length > 0){
                whereConditionForMyActionSong.id = uniqueSongIds
            }

            let get_my_recent_played_song_list = await helper.getMyRecentPlayedList('song_id',req.user.id,'1')
            let my_recent_song_ids = get_my_recent_played_song_list.length > 0 ? await helper.getSongIdArray(get_my_recent_played_song_list,'song_id') : []

            let whereConditionForMyRecentSong = {}
            if([my_recent_song_ids].length > 0){
                whereConditionForMyRecentSong.id = my_recent_song_ids
            }

            let category_list = await models['categories'].findAll({
                where:{
                    status:'1'
                },
                limit:4,
                order:[['position', 'ASC']]
            });

            let trending_now_list = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                where:{
                    status:'1',
                    is_podcast:'1',
                    ...whereConditionForTrendingSongs
                },
                limit:10,
                order:[['id', 'DESC']]
            });
            
            let top_10_songs = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                where:{
                    status:'1',
                    is_podcast:'1',
                    ...whereConditionForTop10Songs
                },
                limit:10,
                order:[['id', 'DESC']]
            });
            
            let from_vault = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                where:{
                    status:'1',
                    is_podcast:'1',
                    is_hall_of_fame:1,
                },
                limit:10,
                order:[['id', 'DESC']]
            });
            
            let recently_added = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                where:{
                    status:'1',
                    is_podcast:'1',
                },
                limit:10,
                order:[['id', 'DESC']]
            });
            
            let recently_played = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        [ sequelize.literal( recently_played_time ), "recently_play_time" ],
                    ]
                },
                where:{
                    status:'1',
                    is_podcast:'1',
                    ...whereConditionForMyRecentSong
                },
                limit:10,
                order: [[sequelize.literal('recently_play_time'), 'DESC']]
                // order:[['id', 'DESC']]
            });

            let finalObj = {
                category_list,
                trending_now_list,
                top_10_songs,
                recently_added,
                from_vault,
                recently_played
            }
			if (finalObj) {
                let msg = "Podcast listing"
                return helper.success(res, msg, finalObj);
            } else {
                let msg = "Data not found!";
                return helper.failed(res, msg)
            }
		} catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },

    type_list: async (req, res) => {
		try {
            let v = new Validator( req.query, {
                type: 'required|integer|in:1,2,3,4,5,6', //1=category_list, 2=trending_now_list, 3=top_10_songs, 4=recently_added, 5=from_vault, 6=recently_played
            });
            let errorsResponse = await helper.checkValidation(v)
            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let isLikeQuery = `ifnull((select is_love from loved_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let isBuyQuery = `ifnull((select count(id) from buy_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let recently_played_time = `ifnull((select updated_at from user_actions where user_id=${req.user.id} AND song_id=songs.id AND type='1' ),'0000-00-00 00:00:00')`;

            // let get_most_buy_song_list = await helper.getBuySongListGroupBy('song_id')
            let get_most_share_song_list = await helper.getMyRecentPlayedList('song_id',req.user.id,'3')
            let share_song_ids = get_most_share_song_list.length > 0 ? await helper.getSongIdArray(get_most_share_song_list,'song_id') : []

            let whereConditionForTop10Songs = {}
            if([share_song_ids].length > 0){
                whereConditionForTop10Songs.id = share_song_ids
            }

            let get_trending_song_list = await helper.getTrendingSongListGroupBy('song_id')
            let trending_song_ids = get_trending_song_list.length > 0 ? await helper.getSongIdArray(get_trending_song_list,'song_id') : []

            let whereConditionForTrendingSongs = {}
            if([trending_song_ids].length > 0){
                whereConditionForTrendingSongs.id = trending_song_ids
            }
            
            let get_popil_picks_song_list = await helper.getPopilPicksSongListGroupBy('song_id',req.user.id)
            let popil_picks_song_ids = get_popil_picks_song_list.length > 0 ? await helper.getSongIdArray(get_popil_picks_song_list,'genres_id') : []
            
            let whereConditionForPopilPicksSongs = {}
            if([popil_picks_song_ids].length > 0){
                whereConditionForPopilPicksSongs.genres_id = popil_picks_song_ids
            }

            let get_language_based_song_list = await helper.getLanguageBasedSongListGroupBy('song_id',req.user.id)
            let user_language_song_ids = get_language_based_song_list.length > 0 ? await helper.getSongIdArray(get_language_based_song_list,'language_id') : []

            if([user_language_song_ids].length > 0){
                whereConditionForPopilPicksSongs.category_id = user_language_song_ids
            }
            
            let get_my_action_song_list = await helper.getMySongActionList('song_id',req.user.id)
            let my_action_song_ids = get_my_action_song_list.length > 0 ? await helper.getSongIdArray(get_my_action_song_list,'song_id') : []

            if([my_action_song_ids].length > 0){
                whereConditionForPopilPicksSongs.id = my_action_song_ids
            }

            let get_hall_of_fame_song_list = await helper.getHallOfFameSongListGroupBy('song_id',req.user.id)
            // let hall_of_fame_song_ids = get_hall_of_fame_song_list.length > 0 ? await helper.getSongIdArray(get_hall_of_fame_song_list,'genres_id') : []
            let hall_of_fame_song_ids = get_hall_of_fame_song_list ? [get_hall_of_fame_song_list.song_id] : []
            
            let whereConditionForHallOfFame = {}
            if([hall_of_fame_song_ids].length > 0){
                whereConditionForHallOfFame.id = hall_of_fame_song_ids
            }


            let whereConditionForPopularArtist = {}
            if([trending_song_ids].length > 0){
                let getSongsSinger = await helper.getSongSingerListGroupBy('user_id',trending_song_ids)
                let song_singer_ids = getSongsSinger.length > 0 ? await helper.getSongIdArray(getSongsSinger,'user_id') : []
                if([song_singer_ids].length > 0){
                    whereConditionForPopularArtist.id = song_singer_ids
                }
            }

            let get_my_recent_played_song_list = await helper.getMyRecentPlayedList('song_id',req.user.id,'1')
            let my_recent_song_ids = get_my_recent_played_song_list.length > 0 ? await helper.getSongIdArray(get_my_recent_played_song_list,'song_id') : []

            let whereConditionForMyRecentSong = {}
            if([my_recent_song_ids].length > 0){
                whereConditionForMyRecentSong.id = my_recent_song_ids
            }

            if(req.query.type == 1){
                let all_list = await models['categories'].findAll({
                    where:{
                        status:'1'
                    },
                    order:[['position', 'ASC']]
                });
                let msg = "Category list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 2){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        ]
                    },
                    where:{
                        status:'1',
                        is_podcast:'1',
                        ...whereConditionForTrendingSongs
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "Trending now list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 3){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        ]
                    },
                    where:{
                        status:'1',
                        is_podcast:'1',
                        ...whereConditionForTop10Songs
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "Top 10 songs list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 4){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        ]
                    },
                    where:{
                        status:'1',
                        is_podcast:'1',
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "Recently added list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 5){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        ]
                    },
                    where:{
                        status:'1',
                        is_podcast:'1',
                        is_hall_of_fame:1,
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "Vault songs list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 6){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                            [ sequelize.literal( recently_played_time ), "recently_play_time" ],
                        ]
                    },
                    where:{
                        status:'1',
                        is_podcast:'1',
                        ...whereConditionForMyRecentSong
                    },
                    order: [[sequelize.literal('recently_play_time'), 'DESC']]
                    // order:[['id', 'DESC']]
                });
                let msg = "Recently played list";
                return helper.success(res, msg, all_list);
            }

        } catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },

    list_by_category: async (req, res) => {
		try {
            console.log(req.body,'--req.body--');
            let v = new Validator( req.body, {
                category_id: 'required|integer',
                shuffle: 'required|integer|in:0,1', //0=off, 1=on
                search_string: 'string',
            });
            let errorsResponse = await helper.checkValidation(v)
            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }
            let whereCondition = {
                status:'1',
                is_podcast:'1',
                category_id: req.body.category_id,
            }
            if(req.body.search_string){
                whereCondition.name = {[Op.like]:  `%${req.body.search_string}%`}
            }

            let orderCondition
            if(req.body.shuffle == 1){
                orderCondition = sequelize.literal('rand()')
            } else {
                orderCondition = [['id', 'DESC']]
            }

            let isLikeQuery = `ifnull((select is_love from loved_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let isBuyQuery = `ifnull((select count(id) from buy_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;

            let all_list = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                include:[
                    {
                        model:models['users'],
                        attributes:['id','name']
                    },
                    {
                        model:models['categories'],
                        attributes:['id','name']
                    },
                    {
                        model:models['genres'],
                        attributes:['id','name']
                    }
                ],
                where:{...whereCondition},
                order : orderCondition
            });
            let msg = "Song list";
            return helper.success(res, msg, all_list);
        } catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },

}