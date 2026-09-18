

exports.CommonQuery = {
  groupReactions: {    
    likes     	: { $sum: "$likes" 	  		},
    dislikes  	: { $sum: "$dislikes" 	  },
    blinds    	: { $sum: "$blinds" 	  	},
    pins      	: { $sum: "$pins" 	  		},
    captures  	: { $sum: "$captures" 	  },
    shares    	: { $sum: "$shares" 	  	},
    views     	: { $sum: "$views" 	  		},
    follows     : { $sum: "$follows" 	    },
    followedBys	: { $sum: "$followedBys"	},
  
    pizzas    	: { $avg: "$pizzas" 	  	},
    ratings   	: { $avg: "$ratings" 	    },
  },
}