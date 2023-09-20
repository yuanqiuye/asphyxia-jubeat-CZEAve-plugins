import ShopInfo from "./routes/shopinfo";
import {getProfile, Getinfo, loadScore, Meeting, getJboxList, getNews} from "./routes/gametop";
import {saveProfile} from "./routes/gameend";
import {Check, Entry, Refresh, Report} from "./routes/lobby";

export async function register() {
    if (CORE_VERSION_MAJOR <= 1 && CORE_VERSION_MINOR < 31) {
      console.error("The current version of Asphyxia Core is not supported. Requires version '1.31' or later.");
      return;
    }
    R.GameCode("L44");
    R.Contributor("yuanqiuye", "https://github.com/yuanqiuye")
    R.Contributor("Chara_", "https://github.com/ItsCharaHere")
    R.Contributor("asesidaa", "https://github.com/asesidaa")
    R.Route("gametop.regist",getProfile);
    R.Route("gametop.get_info", Getinfo);
    R.Route("gametop.get_pdata", getProfile);
    R.Route("gametop.get_mdata", loadScore);
    R.Route("gametop.get_meeting", Meeting);
	  
    // ave routes 
	  R.Route("gametop_ave2.regist",getProfile);
    R.Route("gametop_ave2.get_info", Getinfo);
	  R.Route("demodata_ave2.get_info", Getinfo);
    R.Route("gametop_ave2.get_pdata", getProfile);
    R.Route("gametop_ave2.get_mdata", loadScore);
    R.Route("gametop_ave2.get_meeting", Meeting);
    R.Route("demodata_ave2.get_jbox_list", getJboxList);
    R.Route("demodata_ave2.get_news", getNews);
    R.Route("recommend_ave2.get_recommend", false)
    R.Route("jbox_ave2.get_image", false)
  
    
	  R.Route("gameend.final", true);
    R.Route("gameend.regist", saveProfile);
	  
    // ave routes
	  R.Route("gameend_ave2.final", true);
    R.Route("gameend_ave2.regist", saveProfile);
    
  	R.Route("shopinfo.regist", ShopInfo);
    R.Route("lobby.check", Check);
    R.Route("lobby.entry", Entry);
    R.Route("lobby.refresh", Refresh);
    R.Route("lobby.report", Report);
	  // ave routes
	  R.Route("shopinfo_ave2.regist", ShopInfo);
    R.Route("lobby_ave2.check", Check);
    R.Route("lobby_ave2.entry", Entry);
    R.Route("lobby_ave2.refresh", Refresh);
    R.Route("lobby_ave2.report", Report);
  
  
    R.Route("netlog.send", true);
    R.Route("logger.report", true);
	  R.Route("netlog_ave2.send", true);
    R.Route("logger_ave2.report", true);
    R.Unhandled();
  }