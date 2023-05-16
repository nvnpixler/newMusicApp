const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Validator } = require('node-input-validator');
const modelName = 'songs';

module.exports = {
    
    home_listing: async (req, res) => {
		try {
            let notification_count = await models['notifications'].count({
                where:{
                    receiver_id:req.user.id,
                    is_read:0
                }
            });
            let isLikeQuery = `ifnull((select is_love from loved_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let isBuyQuery = `ifnull((select count(id) from buy_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;

            let played_song_count_query = `ifnull((select count(count) from user_actions where type='1' and song_id=songs.id ),0)`;

            let get_most_buy_song_list = await helper.getBuySongListGroupBy('song_id')
            let buy_song_ids = get_most_buy_song_list.length > 0 ? await helper.getSongIdArray(get_most_buy_song_list,'song_id') : []

            let whereConditionForTop10Songs = {}
            if([buy_song_ids].length > 0){
                whereConditionForTop10Songs.id = buy_song_ids
            }

            let get_trending_song_list = await helper.getTrendingSongListGroupBy('song_id')
            let trending_song_ids = get_trending_song_list.length > 0 ? await helper.getSongIdArray(get_trending_song_list,'song_id') : []
            
            let whereConditionForPopularArtist = {}
            if([trending_song_ids].length > 0){
                let getSongsSinger = await helper.getSongSingerListGroupBy('user_id',trending_song_ids)
                let song_singer_ids = getSongsSinger.length > 0 ? await helper.getSongIdArray(getSongsSinger,'user_id') : []
                if([song_singer_ids].length > 0){
                    whereConditionForPopularArtist.id = song_singer_ids
                }
            }
            
            let get_popil_picks_song_list = await helper.getPopilPicksSongListGroupBy('song_id',req.user.id)
            let popil_picks_song_ids = get_popil_picks_song_list.length > 0 ? await helper.getSongIdArray(get_popil_picks_song_list,'genres_id') : []
            
            let get_language_based_song_list = await helper.getLanguageBasedSongListGroupBy('song_id',req.user.id)
            let user_language_song_ids = get_language_based_song_list.length > 0 ? await helper.getSongIdArray(get_language_based_song_list,'language_id') : []

            let whereConditionForPopilPicksSongs = {}
            if([popil_picks_song_ids].length > 0){
                whereConditionForPopilPicksSongs.genres_id = popil_picks_song_ids
            }
            
            if([user_language_song_ids].length > 0){
                whereConditionForPopilPicksSongs.category_id = user_language_song_ids
            }

            let get_hall_of_fame_song_list = await helper.getHallOfFameSongListGroupBy('song_id',req.user.id)
            // let hall_of_fame_song_ids = get_hall_of_fame_song_list.length > 0 ? await helper.getSongIdArray(get_hall_of_fame_song_list,'genres_id') : []
            let hall_of_fame_song_ids = get_hall_of_fame_song_list ? [get_hall_of_fame_song_list.song_id] : []
            
            let whereConditionForHallOfFame = {}
            /* if([hall_of_fame_song_ids].length > 0){
                whereConditionForHallOfFame.id = hall_of_fame_song_ids
            } */
            if([popil_picks_song_ids].length > 0){
                whereConditionForHallOfFame.genres_id = popil_picks_song_ids
            }
            
            if([user_language_song_ids].length > 0){
                whereConditionForHallOfFame.category_id = user_language_song_ids
            }

            let get_my_action_song_list = await helper.getMySongActionList('song_id',req.user.id)
            let my_action_song_ids = get_my_action_song_list.length > 0 ? await helper.getSongIdArray(get_my_action_song_list,'song_id') : []
            
            let get_my_love_song_list = await helper.getMyLoveSongList(req.user.id)
            let my_love_song_ids = get_my_love_song_list.length > 0 ? await helper.getSongIdArray(get_my_love_song_list,'song_id') : []
            
            let get_my_buy_song_list = await helper.getMyBuySongList(req.user.id)
            let my_buy_song_ids = get_my_buy_song_list.length > 0 ? await helper.getSongIdArray(get_my_buy_song_list,'song_id') : []

            
            let my_song_ids = [...my_action_song_ids,...my_love_song_ids,...my_buy_song_ids]

            // console.log(my_action_song_ids,'--my_action_song_ids---',my_love_song_ids,'--my_love_song_ids--',my_buy_song_ids,'--my_buy_song_ids---',my_song_ids,'--my_song_ids--');

            let uniqueSongIds = [...new Set(my_song_ids)]
            // console.log('================',uniqueSongIds);
            
            let whereConditionForMyActionSong = {}
            if([uniqueSongIds].length > 0){
                whereConditionForMyActionSong.id = uniqueSongIds
            }

            if([my_action_song_ids].length > 0){
                whereConditionForPopilPicksSongs.id = my_action_song_ids
            }

            let get_my_recently_song_list = await helper.getMyRecentPlayedList('song_id',req.user.id,'1')
            let my_recent_song_ids = get_my_recently_song_list.length > 0 ? await helper.getSongIdArray(get_my_recently_song_list,'song_id') : [];

            let newReleaseArray = [...my_love_song_ids,...my_recent_song_ids];

            let newReleaseArrayIds = [...new Set(newReleaseArray)]

            let whereConditionForNewReleaseSong = {}
            if([newReleaseArrayIds].length > 0){
                whereConditionForNewReleaseSong.id = newReleaseArrayIds
            }

            if([user_language_song_ids].length > 0){
                whereConditionForNewReleaseSong.category_id = user_language_song_ids
            }

            //for trending
            let trendingNowArray = [...my_recent_song_ids,...trending_song_ids]
            let trendingNowArrayIds = [...new Set(trendingNowArray)]

            let whereConditionForTrendingSongs = {}
            if([trendingNowArrayIds].length > 0){
                whereConditionForTrendingSongs.id = trendingNowArrayIds
            }

            let category_list = await models['categories'].findAll({
                where:{
                    status:'1'
                },
                limit:4,
                order:[['position', 'ASC']]
            });

            let popular_artist_list = await models['users'].findAll({
                where:{
                    role:'1',
                    // ...whereConditionForPopularArtist
                    // is_otp_verified:1
                },
                limit:6,
                order:[['id', 'DESC']]
            });

            let trending_now_list = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        [ sequelize.literal( played_song_count_query ), "play_count" ],
                    ]
                },
                where:{
                    status:'1',
                    is_podcast:'0',
                    ...whereConditionForTrendingSongs
                },
                limit:10,
                order: [[sequelize.literal('play_count'), 'DESC']],
                // order:[['id', 'DESC']]
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
                    is_podcast:'0',
                    price:{[Op.not]:'0'} ,
                    ...whereConditionForTop10Songs
                },
                limit:10,
                order:[['id', 'DESC']]
            });
            
            // popilpicks_for_you(song)
            // upcoming_popil_buds(song)
            // new_release(song)
            // hall_of_fame(song)
            // genre_list(6)
            /* let popilpicks_for_you = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                where:{
                    status:'1',
                    [Op.or]: {...whereConditionForPopilPicksSongs} 
                },
                limit:3,
                order:[['id', 'DESC']]
            }); */
            let popilpicks_for_you = await models['popil_picks'].findAll({
                where:{
                    status:'1'
                },
                limit:10,
                order:[['id', 'DESC']]
            });
            
            /* let upcoming_popil_buds = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                where:{
                    status:'1'
                },
                limit:3,
                order:[['id', 'DESC']]
            }); */
            let upcoming_popil_buds = await models['users'].findAll({
                where:{
                    role:'1',
                    is_popil_buds:1,
                    // is_otp_verified:1
                },
                limit:10,
                order:[['id', 'DESC']]
            });
            
            let new_release = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                where:{
                    status:'1',
                    is_podcast:'0',
                    [Op.or]:{
                        ...whereConditionForNewReleaseSong
                    }
                },
                limit:10,
                order:[['id', 'DESC']]
            });
            
            let hall_of_fame = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                where:{
                    status:'1',
                    price:'0',
                    is_podcast:'0',
                    is_hall_of_fame:1,
                    [Op.or]: {...whereConditionForPopilPicksSongs} 
                    // ...whereConditionForHallOfFame
                },
                limit:10,
                order:[['id', 'DESC']]
            });
            
            let genre_list = await models['genres'].findAll({
                where:{
                    status:'1'
                },
                limit:3,
                order:[['id', 'DESC']]
            });

            let all_songs = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                where:{
                    status:'1',
                    is_podcast:'0',
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
                    is_podcast:'0',
                },
                limit:10,
                order:[['id', 'DESC']]
            });

            let my_all_songs = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                where:{
                    status:'1',
                    is_podcast:'0',
                    ...whereConditionForMyActionSong
                },
                limit:10,
                order:[['id', 'DESC']]
            });

            let podcast_song = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                where:{
                    status:'1',
                    is_podcast:'1'
                },
                limit:10,
                order:[['id', 'DESC']]
            });

            let finalObj = {
                notification_count,
                category_list,
                popular_artist_list,
                trending_now_list,
                top_10_songs,
                popilpicks_for_you,
                upcoming_popil_buds,
                new_release,
                hall_of_fame,
                genre_list,
                all_songs,
                recently_added,
                my_all_songs,
                podcast_song
            }
			if (finalObj) {
                let msg = "Home listing"
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

    get_home_data_by_type: async (req, res) => {
		try {
            let v = new Validator( req.query, {
                type: 'required|integer|in:1,2,3,4,5,6,7,8,9,10,11,12,13', //1=category_list, 2=popular_artist_list, 3=trending_now_list, 4=top_10_songs, 5=popilpicks_for_you, 6=upcoming_popil_buds, 7=new_release, 8=hall_of_fame, 9=genre_list, 10=all songs, 11=recently added, 12=my all songs, 13=podcast song
            });
            let errorsResponse = await helper.checkValidation(v)
            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let isLikeQuery = `ifnull((select is_love from loved_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let isBuyQuery = `ifnull((select count(id) from buy_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let played_song_count_query = `ifnull((select count(count) from user_actions where type='1' and song_id=songs.id ),0)`;

            let get_most_buy_song_list = await helper.getBuySongListGroupBy('song_id')
            let buy_song_ids = get_most_buy_song_list.length > 0 ? await helper.getSongIdArray(get_most_buy_song_list,'song_id') : []

            let whereConditionForTop10Songs = {}
            if([buy_song_ids].length > 0){
                whereConditionForTop10Songs.id = buy_song_ids
            }

            let get_trending_song_list = await helper.getTrendingSongListGroupBy('song_id')
            let trending_song_ids = get_trending_song_list.length > 0 ? await helper.getSongIdArray(get_trending_song_list,'song_id') : []
            
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

            let get_my_love_song_list = await helper.getMyLoveSongList(req.user.id)
            let my_love_song_ids = get_my_love_song_list.length > 0 ? await helper.getSongIdArray(get_my_love_song_list,'song_id') : []

            let get_my_recently_song_list = await helper.getMyRecentPlayedList('song_id',req.user.id,'1')
            let my_recent_song_ids = get_my_recently_song_list.length > 0 ? await helper.getSongIdArray(get_my_recently_song_list,'song_id') : [];

            let newReleaseArray = [...my_love_song_ids,...my_recent_song_ids];

            let newReleaseArrayIds = [...new Set(newReleaseArray)]

            let whereConditionForNewReleaseSong = {}
            if([newReleaseArrayIds].length > 0){
                whereConditionForNewReleaseSong.id = newReleaseArrayIds
            }

            if([user_language_song_ids].length > 0){
                whereConditionForNewReleaseSong.category_id = user_language_song_ids
            }

            //for trending
            let trendingNowArray = [...my_recent_song_ids,...trending_song_ids]
            let trendingNowArrayIds = [...new Set(trendingNowArray)]

            let whereConditionForTrendingSongs = {}
            if([trendingNowArrayIds].length > 0){
                whereConditionForTrendingSongs.id = trendingNowArrayIds
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
                let all_list = await models['users'].findAll({
                    where:{
                        role:'1',
                        // ...whereConditionForPopularArtist
                        // is_otp_verified:1
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "Popular artist list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 3){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                            [ sequelize.literal( played_song_count_query ), "play_count" ],
                        ]
                    },
                    where:{
                        status:'1',
                        is_podcast:'0',
                        ...whereConditionForTrendingSongs
                    },
                    order: [[sequelize.literal('play_count'), 'DESC']],
                    // order:[['id', 'DESC']]
                });
                let msg = "Trending now list";
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
                        is_podcast:'0',
                        price:{[Op.not]:'0'} ,
                        ...whereConditionForTop10Songs
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "Top 10 songs list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 5){
                let all_list = await models['popil_picks'].findAll({
                    where:{
                        status:'1',
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "Popilpicks for you list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 6){
                /* let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        ]
                    },
                    where:{
                        status:'1'
                    },
                    order:[['id', 'DESC']]
                }); */
                let all_list = await models['users'].findAll({
                    where:{
                        role:'1',
                        is_popil_buds:1,
                        // is_otp_verified:1
                    },
                    // limit:3,
                    order:[['id', 'DESC']]
                });
                let msg = "Upcoming popil buds list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 7){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        ]
                    },
                    where:{
                        status:'1',
                        is_podcast:'0',
                        [Op.or]:{
                            ...whereConditionForNewReleaseSong
                        }
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "New release list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 8){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        ]
                    },
                    where:{
                        status:'1',
                        price: '0',
                        is_podcast:'0',
                        is_hall_of_fame:1,
                        [Op.or]: {...whereConditionForPopilPicksSongs} 
                        // ...whereConditionForHallOfFame
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "Hall of fame list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 9){
                let all_list = await models['genres'].findAll({
                    where:{
                        status:'1'
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "Genre list list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 10){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        ]
                    },
                    where:{
                        status:'1',
                        is_podcast:'0',
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "All songs list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 11){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        ]
                    },
                    where:{
                        status:'1',
                        is_podcast:'0',
                    },
                    limit:20,
                    order:[['id', 'DESC']]
                });
                let msg = "Recently added list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 12){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        ]
                    },
                    where:{
                        status:'1',
                        is_podcast:'0',
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "My all songs list";
                return helper.success(res, msg, all_list);
            }
            if(req.query.type == 13){
                let all_list = await models[modelName].findAll({
                    attributes:{
                        include:[
                            [ sequelize.literal( isLikeQuery ), "is_loved" ],
                            [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        ]
                    },
                    where:{
                        status:'1',
                        is_podcast:'1'
                    },
                    order:[['id', 'DESC']]
                });
                let msg = "Podcast songs list";
                return helper.success(res, msg, all_list);
            }

        } catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },

    get_song_by_category: async (req, res) => {
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
                is_podcast:'0',
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

    get_song_by_genres: async (req, res) => {
		try {
            console.log(req.body,'--req.body--');
            let v = new Validator( req.body, {
                genres_id: 'required|integer',
                shuffle: 'required|integer|in:0,1', //0=off, 1=on
                search_string: 'string',
            });
            let errorsResponse = await helper.checkValidation(v)
            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }
            let whereCondition = {
                status:'1',
                is_podcast:'0',
                genres_id: req.body.genres_id,
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
                order: orderCondition
            });
            let msg = "Song list";
            return helper.success(res, msg, all_list);
        } catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },

    get_song_by_singer: async (req, res) => {
		try {
            console.log(req.body,'--req.body--');
            let v = new Validator( req.body, {
                singer_id: 'required|integer',
                shuffle: 'required|integer|in:0,1', //0=off, 1=on
                search_string: 'string',
            });
            let errorsResponse = await helper.checkValidation(v)
            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }
            let whereCondition = {
                status:'1',
                is_podcast:'0',
                user_id: req.body.singer_id,
            }
            if(req.body.search_string){
                whereCondition.name = {[Op.like]:  `%${req.body.search_string}%`}
            }

            let isLikeQuery = `ifnull((select is_love from loved_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let isBuyQuery = `ifnull((select count(id) from buy_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;

            let orderCondition
            if(req.body.shuffle == 1){
                orderCondition = sequelize.literal('rand()')
            } else {
                orderCondition = [['id', 'DESC']]
            }

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
                order: orderCondition
            });
            let msg = "Song list";
            return helper.success(res, msg, all_list);
        } catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },

    get_song_by_popil_picks: async (req, res) => {
		try {
            console.log(req.body,'--req.body--');
            let v = new Validator( req.body, {
                popil_pick_id: 'required|integer',
                shuffle: 'required|integer|in:0,1', //0=off, 1=on
                search_string: 'string',
            });
            let errorsResponse = await helper.checkValidation(v)
            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }
            let checkExists = await models['popil_picks'].findOne({
                where:{
                    id:req.body.popil_pick_id
                },
                raw:true
            })

            if(!checkExists){
                return helper.failed(res, 'Popil picks not exist')
            }

            let whereCondition = {
                status:'1',
                is_podcast:'0',
            }
            if(req.body.search_string){
                whereCondition.name = {[Op.like]:  `%${req.body.search_string}%`}
            }

            let isLikeQuery = `ifnull((select is_love from loved_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let isBuyQuery = `ifnull((select count(id) from buy_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let isPopilPickQuery = `ifnull((select count(id) from popil_pick_songs where song_id=songs.id ),0)`;

            let orderCondition
            if(req.body.shuffle == 1){
                orderCondition = sequelize.literal('rand()')
            } else {
                orderCondition = [['id', 'DESC']]
            }

            let all_list = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                        [ sequelize.literal( isPopilPickQuery ), "is_popil_pick_added" ],
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
                    },
                    {
                        model:models['popil_pick_songs'],
                        // attributes:['id','name'],
                        where : {
                            popil_pick_id: req.body.popil_pick_id
                        },
                        required:true
                    }
                ],
                where:{...whereCondition},
                // having:{
                //     is_popil_pick_added:{
                //         [Op.not]:  0
                //     }
                // },
                order: orderCondition
            });
            let msg = "Song list";
            return helper.success(res, msg, all_list);
        } catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },
    
    get_song_singer_by_search: async (req, res) => {
		try {
            console.log(req.body,'--req.body--');
            let v = new Validator( req.body, {
                search_string: 'string',
            });
            let errorsResponse = await helper.checkValidation(v)
            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }
            let whereCondition = {
                status:'1',
                // is_podcast:'0',
            }
            if(!req.body.search_string || req.body.search_string == ''){
                let msg = "Song list";
                let obj = {
                    song_list : [],
                    artist_list : []
                }
                return helper.success(res, msg, obj);
            }
            if(req.body.search_string){
                whereCondition.name = {[Op.like]:  `%${req.body.search_string}%`}
            }

            let isLikeQuery = `ifnull((select is_love from loved_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;
            let isBuyQuery = `ifnull((select count(id) from buy_songs where user_id=${req.user.id} and song_id=songs.id ),0)`;

            let song_list = await models[modelName].findAll({
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
                where:{
                    is_podcast:'0',
                    ...whereCondition
                },
            });

            let artist_list = await models['users'].findAll({
                where:{
                    ...whereCondition,
                    role:'1',
                    // is_otp_verified:1
                },
            });

            let obj = {
                song_list,
                artist_list
            }
            let msg = "Song list";
            return helper.success(res, msg, obj);
        } catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },

    action_on_song: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                song_id: 'required',
                type: 'required|in:1,2,3', //1=play song, 2=download, 3=share
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let checkSong= await models[modelName].findOne({
                where : {
                    id : req.body.song_id
                },
                raw:true
            });

            if(!checkSong){
                return helper.failed(res, 'Song not exists!')
            }

            let checkUserAction = await models['user_actions'].findOne({
                where : {
                    song_id : req.body.song_id,
                    type : req.body.type,
                    user_id : req.user.id,
                },
                raw:true
            });
            req.body.user_id = req.user.id
            if(checkUserAction){
                let getCount = parseInt(checkUserAction.count) + 1
                await models['user_actions'].update({
                    count : getCount
                },{
                    where:{
                        id:checkUserAction.id
                    }
                });
            } else {
                req.body.count = 1
                await models['user_actions'].create(req.body);
            }

            if(req.body.type == 2){
                let getSongData = await helper.getSongById(req.body.song_id);
                let saveNotificationObj = {
                    sender_id:req.user.id,
                    receiver_id:req.user.id,
                    song_id:req.body.song_id,
                    message:`'${getSongData.name}' is downloaded successfully.`,
                    type:1
                }
                await models['notifications'].create(saveNotificationObj)
            }

            if(req.body.type == 1){
                let checkCategory = await models['user_languages'].findOne({
                    where:{
                        user_id:req.user.id,
                        language_id:checkSong.category_id
                    }
                });
                if(!checkCategory){
                    await models['user_languages'].create({
                        user_id:req.user.id,
                        language_id:checkSong.category_id
                    });
                }
                let checkGenres = await models['user_genres'].findOne({
                    where:{
                        user_id:req.user.id,
                        genres_id:checkSong.genres_id
                    }
                });
                if(!checkGenres){
                    await models['user_genres'].create({
                        user_id:req.user.id,
                        genres_id:checkSong.genres_id
                    });
                }
            }

            return helper.success(res, "User action saved successfully.", {});
        } catch (err) {
            return helper.failed(res, err);
        }
    },

}