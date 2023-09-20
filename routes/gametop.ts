import Profile from '../models/profile';
import { Score } from '../models/score';

export const getProfile = async (
  info: EamuseInfo,
  data: any,
  send: EamuseSend
) => {
  console.log('gametop.regist');
  let refId = $(data).str('data.player.refid');
  const name = $(data).str('data.player.name');

  console.log(data, { depth: null });
  if (!refId) return send.deny();

  let profile = await DB.FindOne<Profile>(refId, { collection: 'profile' });

  if (!profile && name) {
    const newProfile: Profile = {
      collection: 'profile',
      jubeatId: Math.round(Math.random() * 99999999),
      eventFlag: 0,
      name: name,
      isFirstplay: true,
      emo: [],
      lastShopname: '',
      lastAreaname: '',
    };

    await DB.Upsert<Profile>(refId, { collection: 'profile' }, newProfile);

    profile = newProfile;
  } else if (!profile && !name) {
    return send.deny();
  }

  return send.object(
    {
      data: {
        ...require('../templates/gameInfos.ts')(),

        player: {
          jid: K.ITEM('s32', profile.jubeatId),
          session_id: K.ITEM('s32', 1),
          name: K.ITEM('str', profile.name),
          event_flag: K.ITEM('u64', BigInt(profile.eventFlag || 0)),
          lightchat: { 
            current_map_id: K.ITEM("s32", 99),
            current_event_id: K.ITEM("s32", 1),
            map_list: {
              map: K.ATTR({id: "99"}, {
                tune_count: K.ITEM("s32", 0),
                last_daily_bonus_time: K.ITEM("u64", BigInt(1672667089)),
                event_list: {
                  event: K.ATTR({id: "1"}, {
                    display_state: K.ITEM("s32", 1),
                    condition_list: {
                    },
                    section_list: {
                      section: K.ATTR({id: "1"},{
                        acquired_jwatt: K.ITEM("s32", 50),
                        is_cleared: K.ITEM("bool", false),
                        mission_list:{
                        }
                      })
                    }
                  })
                }
              })
            },
          },
          ...(await require('../templates/profiles.ts')(profile)),
        },
      },
    },
    { compress: true }
  );
};

export const Getinfo = (info: EamuseInfo, data: any, send: EamuseSend) => {
  console.log(data, { depth: null });
  return send.object(
    { data: require('../templates/gameInfos')() },
    { compress: true }
  );
};

export const loadScore = async (info, data, send) => {
  console.log('gametop.get_mdata');
  console.log(data, { depth: null });
  const mdata_ver = $(data).number('data.player.mdata_ver');
  const jubeatId = $(data).number('data.player.jid');
  if (!jubeatId) return send.deny();

  const profile = await DB.FindOne<Profile>(null, {
    collection: 'profile',
    jubeatId,
  });
  if (!profile) return send.deny();

  const scores = await DB.Find<Score>(profile.__refid, { collection: 'score' });
  const scoreData: {
    [musicId: number]: {
      [isHardMode: number]: {
        musicRate: number[];
        score: number[];
        clear: number[];
        playCnt: number[];
        clearCnt: number[];
        fcCnt: number[];
        exCnt: number[];
        bar: number[][];
      };
    };
  } = {};

  for (const score of scores) {
    if (!scoreData[score.musicId]) {
      scoreData[score.musicId] = {};
    }
    if (!scoreData[score.musicId][score.isHardMode ? 1 : 0]) {
      scoreData[score.musicId][score.isHardMode ? 1 : 0] = {
        musicRate: [0, 0, 0],
        playCnt: [0, 0, 0],
        clearCnt: [0, 0, 0],
        fcCnt: [0, 0, 0],
        exCnt: [0, 0, 0],
        clear: [0, 0, 0],
        score: [0, 0, 0],
        bar: [Array(30).fill(0), Array(30).fill(0), Array(30).fill(0)],
      };
    }

    const data = scoreData[score.musicId][score.isHardMode ? 1 : 0];
    data.musicRate[score.seq] = score.musicRate;
    data.playCnt[score.seq] = score.playCount;
    data.clearCnt[score.seq] = score.clearCount;
    data.fcCnt[score.seq] = score.fullcomboCount;
    data.exCnt[score.seq] = score.excellentCount;
    data.clear[score.seq] = score.clear;
    data.score[score.seq] = score.score;
    data.bar[score.seq] = score.bar;
  }

  var sendobj = {
    data: {
      player: {
        jid: K.ITEM('s32', jubeatId),

        mdata_list: {
          music: (() => {
            var musicArray = [];
            Object.keys(scoreData).forEach(musicId =>
              Object.keys(scoreData[musicId]).forEach(isHardMode => {
                musicArray.push(
                  K.ATTR(
                    { music_id: String(musicId) },
                    {
                      [isHardMode === '1' ? 'hard' : 'normal']: {
                        score: K.ARRAY(
                          's32',
                          scoreData[musicId][isHardMode].score
                        ),
                        clear: K.ARRAY(
                          's8',
                          scoreData[musicId][isHardMode].clear
                        ),
                        music_rate: K.ARRAY(
                          's32',
                          scoreData[musicId][isHardMode].musicRate
                        ),
                        play_cnt: K.ARRAY(
                          's32',
                          scoreData[musicId][isHardMode].playCnt
                        ),
                        clear_cnt: K.ARRAY(
                          's32',
                          scoreData[musicId][isHardMode].clearCnt
                        ),
                        fc_cnt: K.ARRAY(
                          's32',
                          scoreData[musicId][isHardMode].fcCnt
                        ),
                        ex_cnt: K.ARRAY(
                          's32',
                          scoreData[musicId][isHardMode].exCnt
                        ),
                        bar: scoreData[musicId][isHardMode].bar.map(
                          (bar, seq) => K.ARRAY('u8', bar, { seq: String(seq) })
                        ),
                      },
                    }
                  )
                );
              })
            );
            return musicArray;
          })(),
        },
      },
    },
  };

  if (mdata_ver != 1) {
    sendobj = {
      data: {
        player: {
          jid: K.ITEM('s32', jubeatId),
          mdata_list: {
            music: [],
          },
        },
      },
    };
  }
  console.log(sendobj, { depth: null });
  return send.object(sendobj, { compress: true });
};

export const Meeting = (req: EamuseInfo, data: any, send: EamuseSend) => {
  return send.object(
    {
      data: {
        meeting: {
          single: K.ATTR({ count: '0' }),
        },
        reward: {
          total: K.ITEM('s32', 0),
          point: K.ITEM('s32', 0),
        },
      },
    },
    { compress: true }
  );
};

export const getJboxList = (info: EamuseInfo, data: any, send: EamuseSend) =>{
  return send.object({
    data: {
      selection: K.ITEM("s32", 0),
      selection_list: K.ITEM("s32", 0),
      is_cache_clear: K.ITEM("s32", 0),
    },
    selection_list: {
      selection: {
        name:  K.ITEM("str", "lmao"),
        image_id: K.ITEM("s32", 1),
        etime: K.ITEM("s64", BigInt(0)),
        target_list: {
          target: {
            appearlist: K.ITEM("s32", 0),
            emblemlist: K.ITEM("s32", 0),
            definedlist: K.ITEM("s32", 0),
            rarity: K.ITEM("s32", 0),
            rarity_special: K.ITEM("s32", 0),
          }
        }
      },
      is_cache_clear: K.ITEM("s32", 0),
    }
  })
}


export const getNews = (info: EamuseInfo, data: any, send: EamuseSend) =>{
  return send.object({
    data: {
    officialnews: {
      newsid: {},
      data: {
        newsid: K.ITEM("s32", 1),
        image: K.ITEM("s32", 0 , {size: "3"})
      }
    }
    }
  })
}
