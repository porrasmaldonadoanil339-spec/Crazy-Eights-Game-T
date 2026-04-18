export type AchievementId =
  // Event wins
  | "event_any_win" | "event_speed_win" | "event_random_win" | "event_double_win" | "event_survival_win"
  // Win milestones
  | "first_win" | "win_5" | "win_25" | "win_100" | "win_250" | "win_500"
  // Mode wins
  | "lightning_king" | "tournament_champ" | "challenge_master" | "expert_survivor"
  | "all_modes" | "practice_grad"
  // Special cards
  | "eight_wizard" | "eight_10" | "eight_50" | "joker_hero" | "joker_final"
  | "chain_two" | "chain_seven" | "j_master" | "triple_play" | "reverse_master"
  // Hands
  | "perfect_hand" | "comeback_king" | "speed_demon" | "marathon_man" | "flawless_expert"
  | "no_special_win" | "speed_30s"
  // Coins
  | "collector_50" | "collector_500" | "collector_1000" | "spender" | "big_spender"
  // Streaks
  | "daily_streak_3" | "daily_streak_7" | "daily_streak_14" | "daily_streak_30" | "daily_streak_60"
  // Store & Collection
  | "first_purchase" | "collector_items5" | "collector_items10" | "collector_items20" | "collector_items30"
  | "fashion" | "effect_equipped" | "frame_equipped" | "title_equipped"
  // Difficulty
  | "hard_win" | "expert_win" | "no_draw_win" | "draw_5" | "draw_10"
  // Social/fun
  | "bad_luck" | "lucky_draw" | "domination" | "underdog" | "marathon_session"
  // Multiplayer
  | "first_multi_win" | "online_winner" | "multi_sessions_5" | "multi_sessions_20"
  // XP/Level milestones
  | "xp_1000" | "xp_10000" | "xp_50000"
  // Battle Pass
  | "bp_tier_10" | "bp_tier_40" | "bp_tier_80"
  // Cards played stats
  | "cards_played_100" | "cards_played_500" | "cards_played_1000"
  // Session streaks
  | "win_3_streak" | "win_5_streak" | "win_10_streak"
  // Multiplier wins/stats
  | "multi_win_5" | "multi_win_10" | "online_win_5" | "online_win_10"
  // Language & Themes
  | "portuguese_player" | "polyglot" | "theme_changer" | "dark_side" | "light_bringer"
  // Store & Collection expansion
  | "collector_items50" | "collector_items70" | "avatar_collector" | "frame_collector"
  // Gameplay specifics
  | "fast_draw" | "no_thinking" | "strategic_win" | "wild_frenzy" | "j_spam" | "seven_trap"
  | "draw_20_total" | "win_with_one_card_left" | "epic_comeback"
  // Level & XP expansion
  | "level_50" | "level_100" | "xp_100000"
  // Social & Others
  | "emote_master" | "silent_player" | "sound_lover" | "session_30m" | "session_1h"
  | "early_bird" | "night_owl" | "weekend_warrior"
  | "lucky_seven" | "crazy_eights_5" | "joker_madness"
  // Expert challenges
  | "expert_10" | "expert_timeout_survive" | "expert_god"
  // ── Expansion to 300 ──────────────────────────────────────────────────────
  // Win milestones+
  | "win_10" | "win_50" | "win_1000" | "win_2500" | "win_5000"
  // Games played milestones
  | "games_10" | "games_25" | "games_50" | "games_100" | "games_500" | "games_1000"
  // Mode-specific expansion
  | "lightning_3" | "lightning_10" | "lightning_25"
  | "tournament_3" | "tournament_10" | "tournament_25"
  | "challenge_1" | "challenge_5" | "challenge_25" | "challenge_100"
  | "practice_25" | "practice_50" | "practice_100"
  // Special cards expansion
  | "eight_25" | "eight_100" | "eight_200"
  | "joker_5" | "joker_30" | "joker_100"
  | "j_game_5" | "ace_block"
  // Hand quality expansion
  | "perfect_hand_3" | "perfect_hand_10"
  | "comeback_3" | "comeback_10"
  | "speed_1m" | "no_special_5"
  | "marathon_15m" | "marathon_25m"
  // Coins expansion
  | "collector_2000" | "collector_5000" | "collector_10000"
  | "big_spender_1000" | "big_spender_5000"
  // Streaks expansion
  | "daily_streak_90" | "daily_streak_180" | "daily_streak_365"
  // Store expansion
  | "collector_items90"
  | "avatar_collector_30" | "frame_collector_25"
  | "title_collector_10" | "effect_collector" | "store_addict"
  // Difficulty expansion
  | "hard_win_5" | "hard_win_25"
  | "expert_25" | "expert_50" | "expert_100" | "expert_no_draw"
  // Multiplayer expansion
  | "multi_win_25" | "multi_win_50" | "multi_win_100"
  | "online_win_25" | "online_win_50" | "online_win_100"
  | "multi_sessions_50" | "multi_sessions_100"
  // XP / Level expansion
  | "xp_500" | "xp_5000" | "xp_25000" | "xp_200000" | "xp_500000"
  | "level_5" | "level_10" | "level_25" | "level_75" | "level_99"
  // Battle Pass expansion
  | "bp_tier_150" | "bp_tier_200" | "bp_tier_250" | "bp_tier_300"
  // Cards played expansion
  | "cards_played_2000" | "cards_played_5000" | "cards_played_10000" | "cards_played_50000"
  // Win streak expansion
  | "win_7_streak" | "win_15_streak" | "win_20_streak"
  // Emote
  | "emote_first" | "emote_5" | "emote_25" | "emote_100"
  // Daily rewards
  | "daily_reward_7" | "daily_reward_30" | "daily_reward_100" | "daily_reward_365"
  // Audio / Settings
  | "mute_toggle" | "sound_all_on" | "audio_lover"
  // Special wins
  | "tournament_perfect" | "domination_5" | "perfect_streak" | "clutch_king"
  // Gameplay specific expansion
  | "wild_frenzy_3" | "j_spam_5" | "seven_trap_3" | "two_chain_3"
  | "joker_comeback" | "perfect_eight" | "defensive_master" | "offensive_master"
  | "rainbow_win" | "last_card_win"
  // Time-based expansion
  | "early_bird_5" | "night_owl_5" | "weekend_warrior_5" | "speed_45s" | "marathon_30m"
  // Language expansion
  | "all_languages" | "spanish_player" | "english_player"
  // Customization
  | "legendary_back" | "legendary_avatar" | "legendary_frame" | "legendary_effect"
  | "legendary_title" | "full_legendary_set"
  // Rarity collection
  | "rare_collector_5" | "epic_collector_3"
  | "legendary_collector_1" | "legendary_collector_3" | "legendary_collector_5"
  // Wild 8 mastery
  | "eight_redirect_10" | "eight_redirect_50"
  | "eight_game_3" | "eight_game_5"
  // Ocho calls
  | "ocho_call_10" | "ocho_call_50" | "ocho_call_100" | "ocho_master"
  // Level extra
  | "level_50_wins"
  // Expert extras
  | "expert_no_timeout" | "expert_masterclass" | "expert_streak_5"
  // Social
  | "emote_master_full" | "silent_champion" | "team_player"
  // Battle pass collection
  | "bp_collector_10" | "bp_collector_50" | "bp_collector_100"
  // Comeback milestones
  | "epic_comeback_3" | "ultimate_comeback" | "miracle_win"
  // Challenge expansion
  | "challenge_streak_3" | "challenge_master_50" | "challenge_legend"
  // Collectors
  | "coin_millionaire" | "coin_spender_master"
  // Pattern wins
  | "all_same_suit" | "multisuit_win"
  // Tournament deep
  | "tournament_champion_25"
  // Wins from behind
  | "never_give_up"
  | "extra_win_1"
  | "extra_win_2"
  | "extra_win_3"
  | "extra_win_4"
  | "extra_win_5"
  | "extra_win_6"
  | "extra_win_7"
  | "extra_win_8"
  | "extra_win_9"
  | "extra_win_10"
  | "extra_win_11"
  | "extra_win_12"
  | "extra_win_13"
  | "extra_win_14"
  | "extra_win_15"
  | "extra_win_16"
  | "extra_win_17"
  | "extra_win_18"
  | "extra_win_19"
  | "extra_win_20"
  | "extra_win_21"
  | "extra_win_22"
  | "extra_win_23"
  | "extra_win_24"
  | "extra_win_25"
  | "extra_win_26"
  | "extra_win_27"
  | "extra_win_28"
  | "extra_win_29"
  | "extra_win_30"
  | "extra_win_31"
  | "extra_win_32"
  | "extra_win_33"
  | "extra_win_34"
  | "extra_win_35"
  | "extra_win_36"
  | "extra_win_37"
  | "extra_win_38"
  | "extra_win_39"
  | "extra_win_40"
  | "extra_win_41"
  | "extra_win_42"
  | "extra_win_43"
  | "extra_win_44"
  | "extra_win_45"
  | "extra_win_46"
  | "extra_win_47"
  | "extra_win_48"
  | "extra_win_49"
  | "extra_win_50"
  | "extra_win_51"
  | "extra_win_52"
  | "extra_win_53"
  | "extra_win_54"
  | "extra_win_55"
  | "extra_win_56"
  | "extra_win_57"
  | "extra_win_58"
  | "extra_win_59"
  | "extra_win_60"
  | "extra_win_61"
  | "extra_win_62"
  | "extra_win_63"
  | "extra_win_64"
  | "extra_win_65"
  | "extra_win_66"
  | "extra_win_67"
  | "extra_win_68"
  | "extra_win_69"
  | "extra_win_70"
  | "streak_ext_1"
  | "streak_ext_2"
  | "streak_ext_3"
  | "streak_ext_4"
  | "streak_ext_5"
  | "streak_ext_6"
  | "streak_ext_7"
  | "streak_ext_8"
  | "streak_ext_9"
  | "streak_ext_10"
  | "streak_ext_11"
  | "streak_ext_12"
  | "streak_ext_13"
  | "streak_ext_14"
  | "streak_ext_15"
  | "streak_ext_16"
  | "streak_ext_17"
  | "streak_ext_18"
  | "streak_ext_19"
  | "streak_ext_20"
  | "streak_ext_21"
  | "streak_ext_22"
  | "streak_ext_23"
  | "streak_ext_24"
  | "streak_ext_25"
  | "streak_ext_26"
  | "streak_ext_27"
  | "streak_ext_28"
  | "streak_ext_29"
  | "streak_ext_30"
  | "streak_ext_31"
  | "streak_ext_32"
  | "streak_ext_33"
  | "streak_ext_34"
  | "streak_ext_35"
  | "streak_ext_36"
  | "streak_ext_37"
  | "streak_ext_38"
  | "streak_ext_39"
  | "streak_ext_40"
  | "streak_ext_41"
  | "streak_ext_42"
  | "streak_ext_43"
  | "streak_ext_44"
  | "streak_ext_45"
  | "streak_ext_46"
  | "streak_ext_47"
  | "streak_ext_48"
  | "streak_ext_49"
  | "streak_ext_50"
  | "streak_ext_51"
  | "streak_ext_52"
  | "streak_ext_53"
  | "streak_ext_54"
  | "streak_ext_55"
  | "streak_ext_56"
  | "streak_ext_57"
  | "streak_ext_58"
  | "streak_ext_59"
  | "streak_ext_60"
  | "streak_ext_61"
  | "streak_ext_62"
  | "streak_ext_63"
  | "streak_ext_64"
  | "streak_ext_65"
  | "streak_ext_66"
  | "streak_ext_67"
  | "streak_ext_68"
  | "streak_ext_69"
  | "streak_ext_70"
  | "special_card_ext_1"
  | "special_card_ext_2"
  | "special_card_ext_3"
  | "special_card_ext_4"
  | "special_card_ext_5"
  | "special_card_ext_6"
  | "special_card_ext_7"
  | "special_card_ext_8"
  | "special_card_ext_9"
  | "special_card_ext_10"
  | "special_card_ext_11"
  | "special_card_ext_12"
  | "special_card_ext_13"
  | "special_card_ext_14"
  | "special_card_ext_15"
  | "special_card_ext_16"
  | "special_card_ext_17"
  | "special_card_ext_18"
  | "special_card_ext_19"
  | "special_card_ext_20"
  | "special_card_ext_21"
  | "special_card_ext_22"
  | "special_card_ext_23"
  | "special_card_ext_24"
  | "special_card_ext_25"
  | "special_card_ext_26"
  | "special_card_ext_27"
  | "special_card_ext_28"
  | "special_card_ext_29"
  | "special_card_ext_30"
  | "special_card_ext_31"
  | "special_card_ext_32"
  | "special_card_ext_33"
  | "special_card_ext_34"
  | "special_card_ext_35"
  | "special_card_ext_36"
  | "special_card_ext_37"
  | "special_card_ext_38"
  | "special_card_ext_39"
  | "special_card_ext_40"
  | "special_card_ext_41"
  | "special_card_ext_42"
  | "special_card_ext_43"
  | "special_card_ext_44"
  | "special_card_ext_45"
  | "special_card_ext_46"
  | "special_card_ext_47"
  | "special_card_ext_48"
  | "special_card_ext_49"
  | "special_card_ext_50"
  | "special_card_ext_51"
  | "special_card_ext_52"
  | "special_card_ext_53"
  | "special_card_ext_54"
  | "special_card_ext_55"
  | "special_card_ext_56"
  | "special_card_ext_57"
  | "special_card_ext_58"
  | "special_card_ext_59"
  | "special_card_ext_60"
  | "special_card_ext_61"
  | "special_card_ext_62"
  | "special_card_ext_63"
  | "special_card_ext_64"
  | "special_card_ext_65"
  | "special_card_ext_66"
  | "special_card_ext_67"
  | "special_card_ext_68"
  | "special_card_ext_69"
  | "special_card_ext_70"
  | "level_ext_1"
  | "level_ext_2"
  | "level_ext_3"
  | "level_ext_4"
  | "level_ext_5"
  | "level_ext_6"
  | "level_ext_7"
  | "level_ext_8"
  | "level_ext_9"
  | "level_ext_10"
  | "level_ext_11"
  | "level_ext_12"
  | "level_ext_13"
  | "level_ext_14"
  | "level_ext_15"
  | "level_ext_16"
  | "level_ext_17"
  | "level_ext_18"
  | "level_ext_19"
  | "level_ext_20"
  | "level_ext_21"
  | "level_ext_22"
  | "level_ext_23"
  | "level_ext_24"
  | "level_ext_25"
  | "level_ext_26"
  | "level_ext_27"
  | "level_ext_28"
  | "level_ext_29"
  | "level_ext_30"
  | "level_ext_31"
  | "level_ext_32"
  | "level_ext_33"
  | "level_ext_34"
  | "level_ext_35"
  | "level_ext_36"
  | "level_ext_37"
  | "level_ext_38"
  | "level_ext_39"
  | "level_ext_40"
  | "level_ext_41"
  | "level_ext_42"
  | "level_ext_43"
  | "level_ext_44"
  | "level_ext_45"
  | "level_ext_46"
  | "level_ext_47"
  | "level_ext_48"
  | "level_ext_49"
  | "level_ext_50"
  | "level_ext_51"
  | "level_ext_52"
  | "level_ext_53"
  | "level_ext_54"
  | "level_ext_55"
  | "level_ext_56"
  | "level_ext_57"
  | "level_ext_58"
  | "level_ext_59"
  | "level_ext_60"
  | "level_ext_61"
  | "level_ext_62"
  | "level_ext_63"
  | "level_ext_64"
  | "level_ext_65"
  | "level_ext_66"
  | "level_ext_67"
  | "level_ext_68"
  | "level_ext_69"
  | "level_ext_70"
  | "multi_ext_1"
  | "multi_ext_2"
  | "multi_ext_3"
  | "multi_ext_4"
  | "multi_ext_5"
  | "multi_ext_6"
  | "multi_ext_7"
  | "multi_ext_8"
  | "multi_ext_9"
  | "multi_ext_10"
  | "multi_ext_11"
  | "multi_ext_12"
  | "multi_ext_13"
  | "multi_ext_14"
  | "multi_ext_15"
  | "multi_ext_16"
  | "multi_ext_17"
  | "multi_ext_18"
  | "multi_ext_19"
  | "multi_ext_20"
  | "multi_ext_21"
  | "multi_ext_22"
  | "multi_ext_23"
  | "multi_ext_24"
  | "multi_ext_25"
  | "multi_ext_26"
  | "multi_ext_27"
  | "multi_ext_28"
  | "multi_ext_29"
  | "multi_ext_30"
  | "multi_ext_31"
  | "multi_ext_32"
  | "multi_ext_33"
  | "multi_ext_34"
  | "multi_ext_35"
  | "multi_ext_36"
  | "multi_ext_37"
  | "multi_ext_38"
  | "multi_ext_39"
  | "multi_ext_40"
  | "multi_ext_41"
  | "multi_ext_42"
  | "multi_ext_43"
  | "multi_ext_44"
  | "multi_ext_45"
  | "multi_ext_46"
  | "multi_ext_47"
  | "multi_ext_48"
  | "multi_ext_49"
  | "multi_ext_50"
  | "multi_ext_51"
  | "multi_ext_52"
  | "multi_ext_53"
  | "multi_ext_54"
  | "multi_ext_55"
  | "multi_ext_56"
  | "multi_ext_57"
  | "multi_ext_58"
  | "multi_ext_59"
  | "multi_ext_60"
  | "multi_ext_61"
  | "multi_ext_62"
  | "multi_ext_63"
  | "multi_ext_64"
  | "multi_ext_65"
  | "multi_ext_66"
  | "multi_ext_67"
  | "multi_ext_68"
  | "multi_ext_69"
  | "multi_ext_70"
  | "collect_ext_1"
  | "collect_ext_2"
  | "collect_ext_3"
  | "collect_ext_4"
  | "collect_ext_5"
  | "collect_ext_6"
  | "collect_ext_7"
  | "collect_ext_8"
  | "collect_ext_9"
  | "collect_ext_10"
  | "collect_ext_11"
  | "collect_ext_12"
  | "collect_ext_13"
  | "collect_ext_14"
  | "collect_ext_15"
  | "collect_ext_16"
  | "collect_ext_17"
  | "collect_ext_18"
  | "collect_ext_19"
  | "collect_ext_20"
  | "collect_ext_21"
  | "collect_ext_22"
  | "collect_ext_23"
  | "collect_ext_24"
  | "collect_ext_25"
  | "collect_ext_26"
  | "collect_ext_27"
  | "collect_ext_28"
  | "collect_ext_29"
  | "collect_ext_30"
  | "collect_ext_31"
  | "collect_ext_32"
  | "collect_ext_33"
  | "collect_ext_34"
  | "collect_ext_35"
  | "collect_ext_36"
  | "collect_ext_37"
  | "collect_ext_38"
  | "collect_ext_39"
  | "collect_ext_40"
  | "collect_ext_41"
  | "collect_ext_42"
  | "collect_ext_43"
  | "collect_ext_44"
  | "collect_ext_45"
  | "collect_ext_46"
  | "collect_ext_47"
  | "collect_ext_48"
  | "collect_ext_49"
  | "collect_ext_50"
  | "collect_ext_51"
  | "collect_ext_52"
  | "collect_ext_53"
  | "collect_ext_54"
  | "collect_ext_55"
  | "collect_ext_56"
  | "collect_ext_57"
  | "collect_ext_58"
  | "collect_ext_59"
  | "collect_ext_60"
  | "collect_ext_61"
  | "collect_ext_62"
  | "collect_ext_63"
  | "collect_ext_64"
  | "collect_ext_65"
  | "collect_ext_66"
  | "collect_ext_67"
  | "collect_ext_68"
  | "collect_ext_69"
  | "collect_ext_70"
  | "time_ext_1"
  | "time_ext_2"
  | "time_ext_3"
  | "time_ext_4"
  | "time_ext_5"
  | "time_ext_6"
  | "time_ext_7"
  | "time_ext_8"
  | "time_ext_9"
  | "time_ext_10"
  | "time_ext_11"
  | "time_ext_12"
  | "time_ext_13"
  | "time_ext_14"
  | "time_ext_15"
  | "time_ext_16"
  | "time_ext_17"
  | "time_ext_18"
  | "time_ext_19"
  | "time_ext_20"
  | "time_ext_21"
  | "time_ext_22"
  | "time_ext_23"
  | "time_ext_24"
  | "time_ext_25"
  | "time_ext_26"
  | "time_ext_27"
  | "time_ext_28"
  | "time_ext_29"
  | "time_ext_30"
  | "time_ext_31"
  | "time_ext_32"
  | "time_ext_33"
  | "time_ext_34"
  | "time_ext_35"
  | "time_ext_36"
  | "time_ext_37"
  | "time_ext_38"
  | "time_ext_39"
  | "time_ext_40"
  | "time_ext_41"
  | "time_ext_42"
  | "time_ext_43"
  | "time_ext_44"
  | "time_ext_45"
  | "time_ext_46"
  | "time_ext_47"
  | "time_ext_48"
  | "time_ext_49"
  | "time_ext_50"
  | "time_ext_51"
  | "time_ext_52"
  | "time_ext_53"
  | "time_ext_54"
  | "time_ext_55"
  | "time_ext_56"
  | "time_ext_57"
  | "time_ext_58"
  | "time_ext_59"
  | "time_ext_60"
  | "time_ext_61"
  | "time_ext_62"
  | "time_ext_63"
  | "time_ext_64"
  | "time_ext_65"
  | "time_ext_66"
  | "time_ext_67"
  | "time_ext_68"
  | "time_ext_69"
  | "time_ext_70"
  | "audio_ext_1"
  | "audio_ext_2"
  | "audio_ext_3"
  | "audio_ext_4"
  | "audio_ext_5"
  | "audio_ext_6"
  | "audio_ext_7"
  | "audio_ext_8"
  | "audio_ext_9"
  | "audio_ext_10"
  | "audio_ext_11"
  | "audio_ext_12"
  | "audio_ext_13"
  | "audio_ext_14"
  | "audio_ext_15"
  | "audio_ext_16"
  | "audio_ext_17"
  | "audio_ext_18"
  | "audio_ext_19"
  | "audio_ext_20"
  | "audio_ext_21"
  | "audio_ext_22"
  | "audio_ext_23"
  | "audio_ext_24"
  | "audio_ext_25"
  | "audio_ext_26"
  | "audio_ext_27"
  | "audio_ext_28"
  | "audio_ext_29"
  | "audio_ext_30"
  | "audio_ext_31"
  | "audio_ext_32"
  | "audio_ext_33"
  | "audio_ext_34"
  | "audio_ext_35"
  | "audio_ext_36"
  | "audio_ext_37"
  | "audio_ext_38"
  | "audio_ext_39"
  | "audio_ext_40"
  | "audio_ext_41"
  | "audio_ext_42"
  | "audio_ext_43"
  | "audio_ext_44"
  | "audio_ext_45"
  | "audio_ext_46"
  | "audio_ext_47"
  | "audio_ext_48"
  | "audio_ext_49"
  | "audio_ext_50"
  | "audio_ext_51"
  | "audio_ext_52"
  | "audio_ext_53"
  | "audio_ext_54"
  | "audio_ext_55"
  | "audio_ext_56"
  | "audio_ext_57"
  | "audio_ext_58"
  | "audio_ext_59"
  | "audio_ext_60"
  | "audio_ext_61"
  | "audio_ext_62"
  | "audio_ext_63"
  | "audio_ext_64"
  | "audio_ext_65"
  | "audio_ext_66"
  | "audio_ext_67"
  | "audio_ext_68"
  | "audio_ext_69"
  | "audio_ext_70"
  | "room_ext_1"
  | "room_ext_2"
  | "room_ext_3"
  | "room_ext_4"
  | "room_ext_5"
  | "room_ext_6"
  | "room_ext_7"
  | "room_ext_8"
  | "room_ext_9"
  | "room_ext_10"
  | "room_ext_11"
  | "room_ext_12"
  | "room_ext_13"
  | "room_ext_14"
  | "room_ext_15"
  | "room_ext_16"
  | "room_ext_17"
  | "room_ext_18"
  | "room_ext_19"
  | "room_ext_20"
  | "room_ext_21"
  | "room_ext_22"
  | "room_ext_23"
  | "room_ext_24"
  | "room_ext_25"
  | "room_ext_26"
  | "room_ext_27"
  | "room_ext_28"
  | "room_ext_29"
  | "room_ext_30"
  | "room_ext_31"
  | "room_ext_32"
  | "room_ext_33"
  | "room_ext_34"
  | "room_ext_35"
  | "room_ext_36"
  | "room_ext_37"
  | "room_ext_38"
  | "room_ext_39"
  | "room_ext_40"
  | "room_ext_41"
  | "room_ext_42"
  | "room_ext_43"
  | "room_ext_44"
  | "room_ext_45"
  | "room_ext_46"
  | "room_ext_47"
  | "room_ext_48"
  | "room_ext_49"
  | "room_ext_50"
  | "room_ext_51"
  | "room_ext_52"
  | "room_ext_53"
  | "room_ext_54"
  | "room_ext_55"
  | "room_ext_56"
  | "room_ext_57"
  | "room_ext_58"
  | "room_ext_59"
  | "room_ext_60"
  | "room_ext_61"
  | "room_ext_62"
  | "room_ext_63"
  | "room_ext_64"
  | "room_ext_65"
  | "room_ext_66"
  | "room_ext_67"
  | "room_ext_68"
  | "room_ext_69"
  | "room_ext_70"
  | "secret_ext_1"
  | "secret_ext_2"
  | "secret_ext_3"
  | "secret_ext_4"
  | "secret_ext_5"
  | "secret_ext_6"
  | "secret_ext_7"
  | "secret_ext_8"
  | "secret_ext_9"
  | "secret_ext_10"
  | "secret_ext_11"
  | "secret_ext_12"
  | "secret_ext_13"
  | "secret_ext_14"
  | "secret_ext_15"
  | "secret_ext_16"
  | "secret_ext_17"
  | "secret_ext_18"
  | "secret_ext_19"
  | "secret_ext_20"
  | "secret_ext_21"
  | "secret_ext_22"
  | "secret_ext_23"
  | "secret_ext_24"
  | "secret_ext_25"
  | "secret_ext_26"
  | "secret_ext_27"
  | "secret_ext_28"
  | "secret_ext_29"
  | "secret_ext_30"
  | "secret_ext_31"
  | "secret_ext_32"
  | "secret_ext_33"
  | "secret_ext_34"
  | "secret_ext_35"
  | "secret_ext_36"
  | "secret_ext_37"
  | "secret_ext_38"
  | "secret_ext_39"
  | "secret_ext_40"
  | "secret_ext_41"
  | "secret_ext_42"
  | "secret_ext_43"
  | "secret_ext_44"
  | "secret_ext_45"
  | "secret_ext_46"
  | "secret_ext_47"
  | "secret_ext_48"
  | "secret_ext_49"
  | "secret_ext_50"
  | "secret_ext_51"
  | "secret_ext_52"
  | "secret_ext_53"
  | "secret_ext_54"
  | "secret_ext_55"
  | "secret_ext_56"
  | "secret_ext_57"
  | "secret_ext_58"
  | "secret_ext_59"
  | "secret_ext_60"
  | "secret_ext_61"
  | "secret_ext_62"
  | "secret_ext_63"
  | "secret_ext_64"
  | "secret_ext_65"
  | "secret_ext_66"
  | "secret_ext_67"
  | "secret_ext_68"
  | "secret_ext_69"
  | "secret_ext_70";

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  target: number;
  coinsReward: number;
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  hidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ─── Event wins ──────────────────────────────────────────────────
  { id: "event_any_win",      title: "Cazador de Eventos",       description: "Gana 5 partidas en cualquier evento especial.", icon: "calendar",         iconColor: "#D4AF37", target: 5,    coinsReward: 200,  xpReward: 500,  rarity: "epic" },
  { id: "event_speed_win",    title: "Reflejos Veloces",         description: "Gana 3 eventos de Velocidad Extrema.",          icon: "flash",            iconColor: "#F39C12", target: 3,    coinsReward: 150,  xpReward: 350,  rarity: "rare" },
  { id: "event_random_win",   title: "Caos Domado",              description: "Gana 3 eventos de Cartas Aleatorias.",          icon: "shuffle",          iconColor: "#9B59B6", target: 3,    coinsReward: 150,  xpReward: 350,  rarity: "rare" },
  { id: "event_double_win",   title: "Doble o Nada",             description: "Gana 3 eventos de Doble Efecto.",               icon: "copy",             iconColor: "#E74C3C", target: 3,    coinsReward: 150,  xpReward: 350,  rarity: "rare" },
  { id: "event_survival_win", title: "Superviviente",            description: "Gana 3 eventos de Supervivencia.",              icon: "shield",           iconColor: "#27AE60", target: 3,    coinsReward: 150,  xpReward: 350,  rarity: "rare" },
  // ─── Win milestones ──────────────────────────────────────────────
  { id: "first_win",        title: "Primera Victoria",          description: "Gana tu primera partida.",                        icon: "star",             iconColor: "#FFD700", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "win_5",            title: "Jugador Experimentado",     description: "Gana 5 partidas.",                                icon: "star-half",        iconColor: "#FFD700", target: 5,    coinsReward: 30,   xpReward: 80,   rarity: "common" },
  { id: "win_25",           title: "Maestro de Cartas",         description: "Gana 25 partidas.",                              icon: "ribbon",           iconColor: "#C0C0C0", target: 25,   coinsReward: 80,   xpReward: 200,  rarity: "rare" },
  { id: "win_100",          title: "Centurión",                 description: "Gana 100 partidas.",                             icon: "trophy",           iconColor: "#D4AF37", target: 100,  coinsReward: 250,  xpReward: 500,  rarity: "epic" },
  { id: "win_250",          title: "Semidiós",                  description: "Gana 250 partidas.",                             icon: "diamond",          iconColor: "#E74C3C", target: 250,  coinsReward: 600,  xpReward: 1200, rarity: "epic" },
  { id: "win_500",          title: "Leyenda Eterna",            description: "Gana 500 partidas.",                             icon: "diamond",          iconColor: "#A855F7", target: 500,  coinsReward: 1000, xpReward: 2000, rarity: "legendary" },
  // ─── Mode wins ───────────────────────────────────────────────────
  { id: "lightning_king",   title: "Rey Relámpago",             description: "Gana 10 partidas en modo Relámpago.",            icon: "flash",            iconColor: "#FFD700", target: 10,   coinsReward: 50,   xpReward: 120,  rarity: "rare" },
  { id: "tournament_champ", title: "Campeón de Torneo",         description: "Gana 3 torneos.",                                icon: "medal",            iconColor: "#E67E22", target: 3,    coinsReward: 100,  xpReward: 300,  rarity: "epic" },
  { id: "challenge_master", title: "Maestro de Desafíos",       description: "Completa 10 desafíos.",                          icon: "checkbox",         iconColor: "#9B59B6", target: 10,   coinsReward: 80,   xpReward: 200,  rarity: "epic" },
  { id: "expert_survivor",  title: "Superviviente Experto",     description: "Gana 5 partidas en modo Experto.",               icon: "timer",            iconColor: "#E74C3C", target: 5,    coinsReward: 150,  xpReward: 400,  rarity: "legendary" },
  { id: "all_modes",        title: "Todoterreno",               description: "Gana en todos los modos de juego.",              icon: "grid",             iconColor: "#9B59B6", target: 5,    coinsReward: 150,  xpReward: 400,  rarity: "legendary" },
  { id: "practice_grad",    title: "Graduado",                  description: "Completa 10 partidas de Práctica.",              icon: "school",           iconColor: "#1A8FC1", target: 10,   coinsReward: 25,   xpReward: 60,   rarity: "common" },
  // ─── Special cards ───────────────────────────────────────────────
  { id: "eight_wizard",     title: "Mago del 8",                description: "Gana una partida con un 8 Loco.",                icon: "diamond",          iconColor: "#1A8FC1", target: 1,    coinsReward: 25,   xpReward: 60,   rarity: "rare" },
  { id: "eight_10",         title: "Locomoción",                description: "Juega 10 ochos locos en total.",                 icon: "infinite",         iconColor: "#9B59B6", target: 10,   coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "eight_50",         title: "Maestro del Ocho",          description: "Juega 50 ochos locos en total.",                 icon: "infinite",         iconColor: "#A855F7", target: 50,   coinsReward: 150,  xpReward: 350,  rarity: "epic" },
  { id: "joker_hero",       title: "El Comodín",                description: "Juega 20 comodines en total.",                   icon: "star",             iconColor: "#FF6B00", target: 20,   coinsReward: 60,   xpReward: 150,  rarity: "rare" },
  { id: "joker_final",      title: "El Comodín Final",          description: "Gana una partida con un Comodín.",               icon: "star",             iconColor: "#A855F7", target: 1,    coinsReward: 80,   xpReward: 200,  rarity: "epic", hidden: true },
  { id: "chain_two",        title: "Cadena del 2",              description: "Acumula 6+ cartas con el 2.",                    icon: "link",             iconColor: "#E74C3C", target: 1,    coinsReward: 35,   xpReward: 90,   rarity: "rare" },
  { id: "chain_seven",      title: "Tormenta del 7",            description: "Acumula 6+ cartas con el 7.",                    icon: "thunderstorm",     iconColor: "#FF6B00", target: 1,    coinsReward: 35,   xpReward: 90,   rarity: "rare" },
  { id: "j_master",         title: "Maestro de la J",           description: "Juega 15 Jotas en total.",                       icon: "repeat",           iconColor: "#27AE60", target: 15,   coinsReward: 45,   xpReward: 110,  rarity: "rare" },
  { id: "reverse_master",   title: "Maestro del Reverso",       description: "Juega 20 cartas 10 en total.",                   icon: "swap-horizontal",  iconColor: "#1A8FC1", target: 20,   coinsReward: 50,   xpReward: 120,  rarity: "rare" },
  { id: "triple_play",      title: "Triple Jugada",             description: "Juega 3 cartas especiales seguidas.",            icon: "layers",           iconColor: "#D4AF37", target: 1,    coinsReward: 40,   xpReward: 100,  rarity: "epic", hidden: true },
  // ─── Hand quality ─────────────────────────────────────────────────
  { id: "perfect_hand",     title: "Mano Perfecta",             description: "Gana sin robar ninguna carta.",                  icon: "sparkles",         iconColor: "#FFD700", target: 1,    coinsReward: 60,   xpReward: 150,  rarity: "epic" },
  { id: "comeback_king",    title: "Rey del Comeback",          description: "Gana con 10+ cartas en mano.",                   icon: "arrow-up-circle",  iconColor: "#E74C3C", target: 1,    coinsReward: 50,   xpReward: 130,  rarity: "epic" },
  { id: "speed_demon",      title: "Demonio Veloz",             description: "Gana en Relámpago en menos de 2 minutos.",       icon: "speedometer",      iconColor: "#E74C3C", target: 1,    coinsReward: 35,   xpReward: 90,   rarity: "rare" },
  { id: "speed_30s",        title: "Relámpago Puro",            description: "Gana una partida en menos de 30 segundos.",      icon: "flash",            iconColor: "#FFD700", target: 1,    coinsReward: 150,  xpReward: 400,  rarity: "legendary", hidden: true },
  { id: "marathon_man",     title: "Maratonista",               description: "Juega una partida de más de 10 minutos.",        icon: "time",             iconColor: "#95A5A6", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "flawless_expert",  title: "Experto Impecable",         description: "Gana en Experto sin robar ninguna carta.",       icon: "shield-checkmark", iconColor: "#D4AF37", target: 1,    coinsReward: 200,  xpReward: 500,  rarity: "legendary", hidden: true },
  { id: "no_special_win",   title: "Sin Poderes",               description: "Gana sin jugar ninguna carta especial.",         icon: "close-circle",     iconColor: "#9B59B6", target: 1,    coinsReward: 100,  xpReward: 250,  rarity: "epic", hidden: true },
  // ─── Coins ────────────────────────────────────────────────────────
  { id: "collector_50",     title: "Ahorrador",                 description: "Acumula 50 monedas.",                            icon: "cash",             iconColor: "#F1C40F", target: 50,   coinsReward: 10,   xpReward: 30,   rarity: "common" },
  { id: "collector_500",    title: "Rico Rico",                 description: "Acumula 500 monedas.",                           icon: "wallet",           iconColor: "#D4AF37", target: 500,  coinsReward: 50,   xpReward: 150,  rarity: "epic" },
  { id: "collector_1000",   title: "Millonario de Cartas",      description: "Acumula 1000 monedas.",                          icon: "diamond",          iconColor: "#A855F7", target: 1000, coinsReward: 150,  xpReward: 400,  rarity: "legendary" },
  { id: "spender",          title: "Comprador",                 description: "Compra 3 artículos en la tienda.",               icon: "bag",              iconColor: "#E74C3C", target: 3,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "big_spender",      title: "Gran Comprador",            description: "Gasta 500 monedas en total.",                    icon: "bag-add",          iconColor: "#D4AF37", target: 500,  coinsReward: 60,   xpReward: 150,  rarity: "rare" },
  // ─── Streaks ──────────────────────────────────────────────────────
  { id: "daily_streak_3",   title: "Constante",                 description: "Juega 3 días seguidos.",                         icon: "calendar",         iconColor: "#1A8FC1", target: 3,    coinsReward: 25,   xpReward: 60,   rarity: "common" },
  { id: "daily_streak_7",   title: "Adicto al Juego",           description: "Juega 7 días seguidos.",                         icon: "flame",            iconColor: "#E67E22", target: 7,    coinsReward: 70,   xpReward: 180,  rarity: "rare" },
  { id: "daily_streak_14",  title: "Fanático",                  description: "Juega 14 días seguidos.",                        icon: "flame",            iconColor: "#E74C3C", target: 14,   coinsReward: 150,  xpReward: 400,  rarity: "epic" },
  { id: "daily_streak_30",  title: "Obsesionado",               description: "Juega 30 días seguidos.",                        icon: "infinite",         iconColor: "#A855F7", target: 30,   coinsReward: 500,  xpReward: 1500, rarity: "legendary" },
  { id: "daily_streak_60",  title: "Adicto Total",              description: "Juega 60 días seguidos.",                        icon: "trophy",           iconColor: "#FF4400", target: 60,   coinsReward: 1000, xpReward: 3000, rarity: "legendary" },
  // ─── Store & Collection ───────────────────────────────────────────
  { id: "first_purchase",   title: "Primera Compra",            description: "Compra tu primer artículo en la tienda.",        icon: "bag-check",        iconColor: "#27AE60", target: 1,    coinsReward: 15,   xpReward: 40,   rarity: "common" },
  { id: "collector_items5", title: "Coleccionista",             description: "Posee 5 artículos de la tienda.",                icon: "albums",           iconColor: "#9B59B6", target: 5,    coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "collector_items10",title: "Gran Coleccionista",        description: "Posee 10 artículos de la tienda.",               icon: "library",          iconColor: "#D4AF37", target: 10,   coinsReward: 100,  xpReward: 250,  rarity: "epic" },
  { id: "collector_items20",title: "Connoisseur",               description: "Posee 20 artículos de la tienda.",               icon: "diamond",          iconColor: "#E74C3C", target: 20,   coinsReward: 200,  xpReward: 500,  rarity: "epic" },
  { id: "collector_items30",title: "Maestro Coleccionista",     description: "Posee 30 artículos de la tienda.",               icon: "star",             iconColor: "#A855F7", target: 30,   coinsReward: 400,  xpReward: 1000, rarity: "legendary" },
  { id: "fashion",          title: "A la Moda",                 description: "Equipa un dorso y avatar legendarios.",          icon: "color-palette",    iconColor: "#A855F7", target: 1,    coinsReward: 80,   xpReward: 200,  rarity: "epic" },
  { id: "effect_equipped",  title: "Efectista",                 description: "Equipa un efecto visual en tu perfil.",          icon: "sparkles",         iconColor: "#D4AF37", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "frame_equipped",   title: "Enmarcado",                 description: "Equipa un marco en tu avatar.",                  icon: "ellipse",          iconColor: "#C0C0C0", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "title_equipped",   title: "Con Identidad",             description: "Equipa un título en tu perfil.",                 icon: "ribbon",           iconColor: "#2196F3", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  // ─── Difficulty ───────────────────────────────────────────────────
  { id: "hard_win",         title: "Gladiador",                 description: "Gana una partida en dificultad Difícil.",        icon: "shield",           iconColor: "#E74C3C", target: 1,    coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "expert_win",       title: "Experto Real",              description: "Gana una partida en modo Experto.",              icon: "timer",            iconColor: "#FF0000", target: 1,    coinsReward: 100,  xpReward: 300,  rarity: "epic" },
  { id: "expert_10",        title: "Maestro del Tiempo",        description: "Gana 10 partidas en modo Experto.",              icon: "timer",            iconColor: "#FF4400", target: 10,   coinsReward: 300,  xpReward: 800,  rarity: "legendary" },
  { id: "expert_timeout_survive", title: "Sangre Fría",        description: "Juega con menos de 2 segundos en experto sin perder.", icon: "timer",      iconColor: "#A855F7", target: 1,    coinsReward: 80,   xpReward: 200,  rarity: "epic", hidden: true },
  { id: "no_draw_win",      title: "Sin Piedad",                description: "Gana sin que el CPU robe una carta.",            icon: "close-circle",     iconColor: "#27AE60", target: 1,    coinsReward: 45,   xpReward: 110,  rarity: "rare", hidden: true },
  { id: "draw_5",           title: "Generoso",                  description: "Haz robar 5+ cartas al CPU en 1 partida.",       icon: "layers",           iconColor: "#E67E22", target: 5,    coinsReward: 30,   xpReward: 75,   rarity: "rare" },
  { id: "draw_10",          title: "Muy Generoso",              description: "Haz robar 10+ cartas al CPU en 1 partida.",      icon: "layers",           iconColor: "#C0392B", target: 10,   coinsReward: 60,   xpReward: 150,  rarity: "epic" },
  // ─── Social / Fun ─────────────────────────────────────────────────
  { id: "bad_luck",         title: "Mala Suerte",               description: "Roba 5+ cartas de más en 1 partida.",            icon: "sad",              iconColor: "#95A5A6", target: 1,    coinsReward: 10,   xpReward: 20,   rarity: "common", hidden: true },
  { id: "lucky_draw",       title: "Golpe de Suerte",           description: "Roba y juega 3 cartas seguidas.",                icon: "happy",            iconColor: "#27AE60", target: 1,    coinsReward: 25,   xpReward: 60,   rarity: "rare", hidden: true },
  { id: "domination",       title: "Dominación Total",          description: "Gana en Difícil sin robar ninguna carta.",       icon: "flash",            iconColor: "#D4AF37", target: 1,    coinsReward: 120,  xpReward: 350,  rarity: "legendary", hidden: true },
  { id: "underdog",         title: "El Perro del Sota",         description: "Gana con 13+ cartas en mano.",                   icon: "arrow-up",         iconColor: "#E74C3C", target: 1,    coinsReward: 80,   xpReward: 200,  rarity: "epic", hidden: true },
  { id: "marathon_session", title: "Maratón Total",             description: "Juega 10 partidas en un día.",                   icon: "fitness",          iconColor: "#27AE60", target: 10,   coinsReward: 50,   xpReward: 120,  rarity: "rare" },
  // ─── Multiplayer ──────────────────────────────────────────────────
  { id: "first_multi_win",  title: "Victoria en Mesa",          description: "Gana una partida de multijugador local.",        icon: "people",           iconColor: "#27AE60", target: 1,    coinsReward: 40,   xpReward: 100,  rarity: "common" },
  { id: "online_winner",    title: "Campeón Online",            description: "Gana una partida en modo online.",               icon: "globe",            iconColor: "#4A90E2", target: 1,    coinsReward: 60,   xpReward: 150,  rarity: "rare" },
  { id: "multi_sessions_5", title: "Social",                    description: "Juega 5 partidas multijugador.",                 icon: "chatbubbles",      iconColor: "#1A8FC1", target: 5,    coinsReward: 30,   xpReward: 80,   rarity: "common" },
  { id: "multi_sessions_20",title: "Muy Social",                description: "Juega 20 partidas multijugador.",                icon: "people-circle",    iconColor: "#9B59B6", target: 20,   coinsReward: 100,  xpReward: 250,  rarity: "epic" },
  // ─── XP / Level milestones ────────────────────────────────────────
  { id: "xp_1000",          title: "Subida de Nivel",           description: "Gana 1000 XP en total.",                        icon: "star",             iconColor: "#D4AF37", target: 1000,  coinsReward: 30,  xpReward: 0,    rarity: "common" },
  { id: "xp_10000",         title: "Veterano de XP",            description: "Gana 10000 XP en total.",                       icon: "star",             iconColor: "#D4AF37", target: 10000, coinsReward: 100, xpReward: 0,    rarity: "rare" },
  { id: "xp_50000",         title: "Maestro de la Experiencia", description: "Gana 50000 XP en total.",                       icon: "diamond",          iconColor: "#A855F7", target: 50000, coinsReward: 300, xpReward: 0,    rarity: "epic" },
  // ─── Battle Pass ──────────────────────────────────────────────────
  { id: "bp_tier_10",       title: "Pase Desbloqueado",         description: "Alcanza el nivel 10 del Pase de Batalla.",      icon: "star",             iconColor: "#1A8FC1", target: 10,   coinsReward: 50,   xpReward: 100,  rarity: "rare" },
  { id: "bp_tier_40",       title: "Pase Élite",                description: "Alcanza el nivel 40 del Pase de Batalla.",      icon: "medal",            iconColor: "#D4AF37", target: 40,   coinsReward: 200,  xpReward: 500,  rarity: "epic" },
  { id: "bp_tier_80",       title: "Pase Legendario",           description: "Alcanza el nivel 80 del Pase de Batalla.",      icon: "trophy",           iconColor: "#A855F7", target: 80,   coinsReward: 1000, xpReward: 2000, rarity: "legendary" },
  // ─── Cards played stats ───────────────────────────────────────────
  { id: "cards_played_100", title: "Baraja Activa",             description: "Juega 100 cartas en total.",                    icon: "albums",           iconColor: "#95A5A6", target: 100,  coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "cards_played_500", title: "La Baraja Infinita",        description: "Juega 500 cartas en total.",                    icon: "infinite",         iconColor: "#2196F3", target: 500,  coinsReward: 60,   xpReward: 150,  rarity: "rare" },
  { id: "cards_played_1000",title: "Maestro Baraja",            description: "Juega 1000 cartas en total.",                   icon: "layers",           iconColor: "#D4AF37", target: 1000, coinsReward: 150,  xpReward: 400,  rarity: "epic" },
  // ─── Win streaks ──────────────────────────────────────────────────
  { id: "win_3_streak",     title: "Racha Caliente",            description: "Gana 3 partidas seguidas.",                     icon: "flame",            iconColor: "#E67E22", target: 3,    coinsReward: 30,   xpReward: 75,   rarity: "common" },
  { id: "win_5_streak",     title: "Imparable",                 description: "Gana 5 partidas seguidas.",                     icon: "flash",            iconColor: "#E74C3C", target: 5,    coinsReward: 80,   xpReward: 200,  rarity: "rare" },
  { id: "win_10_streak",    title: "Invicto",                   description: "Gana 10 partidas seguidas.",                    icon: "trophy",           iconColor: "#D4AF37", target: 10,   coinsReward: 200,  xpReward: 500,  rarity: "legendary", hidden: true },
  // ─── Multiplayer Expansion ───────────────────────────────────────
  { id: "multi_win_5",      title: "Dominio Local",             description: "Gana 5 partidas multijugador local.",           icon: "people",           iconColor: "#2196F3", target: 5,    coinsReward: 50,   xpReward: 150,  rarity: "rare" },
  { id: "multi_win_10",     title: "Rey de la Mesa",            description: "Gana 10 partidas multijugador local.",          icon: "ribbon",           iconColor: "#9B59B6", target: 10,   coinsReward: 100,  xpReward: 300,  rarity: "epic" },
  { id: "online_win_5",     title: "Pro Online",                description: "Gana 5 partidas online.",                        icon: "globe",            iconColor: "#E74C3C", target: 5,    coinsReward: 80,   xpReward: 200,  rarity: "rare" },
  { id: "online_win_10",    title: "Leyenda de la Red",         description: "Gana 10 partidas online.",                       icon: "diamond",          iconColor: "#A855F7", target: 10,   coinsReward: 200,  xpReward: 500,  rarity: "legendary" },
  // ─── Language & Themes ──────────────────────────────────────────
  { id: "portuguese_player",title: "Tudo Bem!",                 description: "Juega en Portugués.",                            icon: "language",         iconColor: "#27AE60", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "polyglot",         title: "Políglota",                 description: "Cambia el idioma 5 veces.",                      icon: "repeat",           iconColor: "#1A8FC1", target: 5,    coinsReward: 30,   xpReward: 80,   rarity: "rare" },
  { id: "theme_changer",    title: "Decorador",                 description: "Cambia el tema visual.",                         icon: "color-palette",    iconColor: "#9B59B6", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "dark_side",        title: "Lado Oscuro",               description: "Juega 10 partidas en modo oscuro.",              icon: "moon",             iconColor: "#4A90E2", target: 10,   coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "light_bringer",    title: "Portador de Luz",           description: "Juega 10 partidas en modo claro.",               icon: "sunny",            iconColor: "#FFD700", target: 10,   coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  // ─── Store & Collection expansion ───────────────────────────────
  { id: "collector_items50",title: "Magnate de la Tienda",      description: "Posee 50 artículos de la tienda.",                icon: "cart",             iconColor: "#D4AF37", target: 50,   coinsReward: 600,  xpReward: 1500, rarity: "epic" },
  { id: "collector_items70",title: "Colección Completa",        description: "Posee 70 artículos de la tienda.",                icon: "trophy",           iconColor: "#A855F7", target: 70,   coinsReward: 1500, xpReward: 4000, rarity: "legendary" },
  { id: "avatar_collector", title: "Mil Caras",                 description: "Posee 20 avatares diferentes.",                   icon: "person-circle",    iconColor: "#1A8FC1", target: 20,   coinsReward: 100,  xpReward: 250,  rarity: "rare" },
  { id: "frame_collector",  title: "Enmarcador Pro",            description: "Posee 15 marcos diferentes.",                     icon: "square",           iconColor: "#9B59B6", target: 15,   coinsReward: 80,   xpReward: 200,  rarity: "rare" },
  // ─── Gameplay Specifics ──────────────────────────────────────────
  { id: "fast_draw",        title: "Mano Rápida",               description: "Roba una carta en menos de 1 segundo.",          icon: "flash",            iconColor: "#FF6B00", target: 1,    coinsReward: 15,   xpReward: 40,   rarity: "common" },
  { id: "no_thinking",      title: "Pura Intuición",            description: "Gana una partida sin usar sugerencias.",         icon: "bulb",             iconColor: "#27AE60", target: 1,    coinsReward: 50,   xpReward: 120,  rarity: "rare" },
  { id: "strategic_win",    title: "Estratega",                 description: "Guarda una carta especial para el final y gana.", icon: "star",             iconColor: "#D4AF37", target: 1,    coinsReward: 60,   xpReward: 150,  rarity: "epic" },
  { id: "wild_frenzy",      title: "Frenesí Loco",              description: "Juega 3 ochos locos en una sola partida.",        icon: "infinite",         iconColor: "#A855F7", target: 1,    coinsReward: 45,   xpReward: 110,  rarity: "epic" },
  { id: "j_spam",           title: "Bloqueador",                description: "Juega 5 Jotas en una sola partida.",              icon: "hand-left",        iconColor: "#E74C3C", target: 1,    coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "seven_trap",       title: "Trampa del 7",              description: "Haz que un oponente robe 10 cartas seguidas.",   icon: "layers",           iconColor: "#FF4400", target: 1,    coinsReward: 100,  xpReward: 250,  rarity: "legendary", hidden: true },
  { id: "draw_20_total",    title: "Aspiradora de Cartas",      description: "Roba 20 cartas en una sola partida.",            icon: "nuclear",          iconColor: "#95A5A6", target: 1,    coinsReward: 30,   xpReward: 70,   rarity: "rare", hidden: true },
  { id: "win_with_one_card_left", title: "Al Límite",           description: "Gana cuando el CPU solo tiene 1 carta.",         icon: "alert-circle",     iconColor: "#E67E22", target: 1,    coinsReward: 35,   xpReward: 90,   rarity: "rare" },
  { id: "epic_comeback",    title: "Remontada Legendaria",      description: "Gana después de tener 15+ cartas más que el rival.", icon: "trending-up",      iconColor: "#A855F7", target: 1,    coinsReward: 150,  xpReward: 400,  rarity: "legendary" },
  // ─── Level & XP expansion ───────────────────────────────────────
  { id: "level_50",         title: "Veterano de Oro",           description: "Alcanza el nivel 50.",                           icon: "shield",           iconColor: "#D4AF37", target: 50,   coinsReward: 500,  xpReward: 0,    rarity: "epic" },
  { id: "level_100",        title: "Maestro Supremo",           description: "Alcanza el nivel 100.",                          icon: "trophy",           iconColor: "#A855F7", target: 100,  coinsReward: 2000, xpReward: 0,    rarity: "legendary" },
  { id: "xp_100000",        title: "Acumulador de Saber",       description: "Gana 100000 XP en total.",                      icon: "star",             iconColor: "#FFD700", target: 100000, coinsReward: 1000, xpReward: 0,   rarity: "legendary" },
  // ─── Social & Others ────────────────────────────────────────────
  { id: "emote_master",     title: "Expresivo",                 description: "Usa 50 emotes en partidas.",                     icon: "happy",            iconColor: "#F1C40F", target: 50,   coinsReward: 40,   xpReward: 100,  rarity: "common" },
  { id: "silent_player",    title: "Silencioso",                description: "Gana 5 partidas sin usar emotes.",               icon: "volume-mute",      iconColor: "#95A5A6", target: 5,    coinsReward: 30,   xpReward: 80,   rarity: "rare" },
  { id: "sound_lover",      title: "Melómano",                  description: "Escucha música por más de 30 minutos.",          icon: "musical-notes",    iconColor: "#FF4400", target: 1,    coinsReward: 25,   xpReward: 60,   rarity: "common" },
  { id: "session_30m",      title: "Sesión Intensa",            description: "Juega por 30 minutos seguidos.",                 icon: "time",             iconColor: "#1A8FC1", target: 1,    coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "session_1h",       title: "Maratón Real",              description: "Juega por 1 hora seguida.",                      icon: "stopwatch",        iconColor: "#E74C3C", target: 1,    coinsReward: 100,  xpReward: 250,  rarity: "epic" },
  { id: "early_bird",       title: "Madrugador",                description: "Gana una partida antes de las 8 AM.",            icon: "sunny",            iconColor: "#FFD700", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "night_owl",        title: "Búho Nocturno",             description: "Gana una partida después de la medianoche.",     icon: "moon",             iconColor: "#4A90E2", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "weekend_warrior",  title: "Guerrero del Finde",        description: "Gana 10 partidas en un solo fin de semana.",      icon: "calendar",         iconColor: "#E67E22", target: 10,   coinsReward: 70,   xpReward: 180,  rarity: "rare" },
  { id: "lucky_seven",      title: "Siete de la Suerte",        description: "Juega un 7 para ganar la partida.",              icon: "star",             iconColor: "#FFD700", target: 1,    coinsReward: 50,   xpReward: 120,  rarity: "rare", hidden: true },
  { id: "crazy_eights_5",   title: "Locura de Ochos",           description: "Juega 5 ochos en una partida.",                  icon: "infinite",         iconColor: "#A855F7", target: 1,    coinsReward: 100,  xpReward: 250,  rarity: "epic" },
  { id: "joker_madness",    title: "Caos del Comodín",          description: "Gana una partida donde se jugaron 4 comodines.", icon: "star-half",        iconColor: "#FF6B00", target: 1,    coinsReward: 80,   xpReward: 200,  rarity: "epic" },
  // ─── Expert Expansion ───────────────────────────────────────────
  { id: "expert_god",       title: "Dios del Tiempo",           description: "Gana 50 partidas en modo Experto.",              icon: "timer",            iconColor: "#000000", target: 50,   coinsReward: 2000, xpReward: 5000, rarity: "legendary" },
  // ── Expansion Block (114 → 300) ──────────────────────────────────────────
  // Win milestones+
  { id: "win_10",           title: "En Racha",                   description: "Gana 10 partidas.",                              icon: "trending-up",      iconColor: "#27AE60", target: 10,    coinsReward: 35,   xpReward: 90,    rarity: "common" },
  { id: "win_50",           title: "Veterano",                   description: "Gana 50 partidas.",                              icon: "ribbon",           iconColor: "#1A8FC1", target: 50,    coinsReward: 120,  xpReward: 300,   rarity: "rare" },
  { id: "win_1000",         title: "Mil Victorias",              description: "Gana 1000 partidas.",                            icon: "trophy",           iconColor: "#FF4400", target: 1000,  coinsReward: 1500, xpReward: 4000,  rarity: "legendary" },
  { id: "win_2500",         title: "Leyenda de las Cartas",      description: "Gana 2500 partidas.",                            icon: "diamond",          iconColor: "#A855F7", target: 2500,  coinsReward: 3000, xpReward: 8000,  rarity: "legendary" },
  { id: "win_5000",         title: "Inmortal de la Mesa",        description: "Gana 5000 partidas.",                            icon: "infinite",         iconColor: "#D4AF37", target: 5000,  coinsReward: 5000, xpReward: 15000, rarity: "legendary" },
  // Games played milestones
  { id: "games_10",         title: "Practicante",                description: "Juega 10 partidas.",                             icon: "game-controller",  iconColor: "#95A5A6", target: 10,    coinsReward: 10,   xpReward: 25,    rarity: "common" },
  { id: "games_25",         title: "Aficionado",                 description: "Juega 25 partidas.",                             icon: "game-controller",  iconColor: "#1A8FC1", target: 25,    coinsReward: 20,   xpReward: 50,    rarity: "common" },
  { id: "games_50",         title: "Habitual",                   description: "Juega 50 partidas.",                             icon: "game-controller",  iconColor: "#27AE60", target: 50,    coinsReward: 40,   xpReward: 100,   rarity: "common" },
  { id: "games_100",        title: "Dedicado",                   description: "Juega 100 partidas.",                            icon: "game-controller",  iconColor: "#D4AF37", target: 100,   coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "games_500",        title: "Obsesionado con el Juego",   description: "Juega 500 partidas.",                            icon: "game-controller",  iconColor: "#9B59B6", target: 500,   coinsReward: 250,  xpReward: 600,   rarity: "epic" },
  { id: "games_1000",       title: "Dios del Mazo",              description: "Juega 1000 partidas.",                           icon: "game-controller",  iconColor: "#A855F7", target: 1000,  coinsReward: 600,  xpReward: 1500,  rarity: "legendary" },
  // Mode-specific expansion
  { id: "lightning_3",      title: "Buen Comienzo Relámpago",    description: "Gana 3 partidas en modo Relámpago.",             icon: "flash",            iconColor: "#FFD700", target: 3,     coinsReward: 20,   xpReward: 50,    rarity: "common" },
  { id: "lightning_10",     title: "Señor del Relámpago",        description: "Gana 10 partidas en modo Relámpago.",            icon: "flash",            iconColor: "#E74C3C", target: 10,    coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "lightning_25",     title: "Rayo Imparable",             description: "Gana 25 partidas en modo Relámpago.",            icon: "flash",            iconColor: "#A855F7", target: 25,    coinsReward: 150,  xpReward: 400,   rarity: "epic" },
  { id: "tournament_3",     title: "Tres Torneos",               description: "Gana 3 torneos.",                                icon: "medal",            iconColor: "#D4AF37", target: 3,     coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "tournament_10",    title: "Campeón Consistente",        description: "Gana 10 torneos.",                               icon: "medal",            iconColor: "#E67E22", target: 10,    coinsReward: 200,  xpReward: 600,   rarity: "epic" },
  { id: "tournament_25",    title: "Leyenda del Torneo",         description: "Gana 25 torneos.",                               icon: "trophy",           iconColor: "#A855F7", target: 25,    coinsReward: 600,  xpReward: 1500,  rarity: "legendary" },
  { id: "challenge_1",      title: "El Primer Desafío",          description: "Completa 1 desafío.",                            icon: "checkbox",         iconColor: "#27AE60", target: 1,     coinsReward: 15,   xpReward: 40,    rarity: "common" },
  { id: "challenge_5",      title: "Desafiante en Serio",        description: "Completa 5 desafíos.",                           icon: "checkbox",         iconColor: "#E67E22", target: 5,     coinsReward: 50,   xpReward: 130,   rarity: "rare" },
  { id: "challenge_25",     title: "Cazador de Desafíos",        description: "Completa 25 desafíos.",                          icon: "checkbox",         iconColor: "#9B59B6", target: 25,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "challenge_100",    title: "Rey de los Desafíos",        description: "Completa 100 desafíos.",                         icon: "trophy",           iconColor: "#D4AF37", target: 100,   coinsReward: 800,  xpReward: 2000,  rarity: "legendary" },
  { id: "practice_25",      title: "Constante Practicante",      description: "Completa 25 partidas de Práctica.",              icon: "school",           iconColor: "#2196F3", target: 25,    coinsReward: 40,   xpReward: 100,   rarity: "common" },
  { id: "practice_50",      title: "Eterno Estudiante",          description: "Completa 50 partidas de Práctica.",              icon: "school",           iconColor: "#9B59B6", target: 50,    coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "practice_100",     title: "Maestro del Entrenamiento",  description: "Completa 100 partidas de Práctica.",             icon: "school",           iconColor: "#D4AF37", target: 100,   coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  // Special cards expansion
  { id: "eight_25",         title: "Cazador de Ochos",           description: "Juega 25 ochos locos en total.",                 icon: "infinite",         iconColor: "#1A8FC1", target: 25,    coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "eight_100",        title: "Experto del Ocho",           description: "Juega 100 ochos locos en total.",                icon: "infinite",         iconColor: "#E74C3C", target: 100,   coinsReward: 250,  xpReward: 600,   rarity: "epic" },
  { id: "eight_200",        title: "Adicto al Ocho",             description: "Juega 200 ochos locos en total.",                icon: "infinite",         iconColor: "#D4AF37", target: 200,   coinsReward: 600,  xpReward: 1500,  rarity: "legendary" },
  { id: "joker_5",          title: "Comodín Iniciado",           description: "Juega 5 comodines en total.",                    icon: "star",             iconColor: "#FFD700", target: 5,     coinsReward: 20,   xpReward: 50,    rarity: "common" },
  { id: "joker_30",         title: "Mago del Comodín",           description: "Juega 30 comodines en total.",                   icon: "star",             iconColor: "#E67E22", target: 30,    coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "joker_100",        title: "El Joker Supremo",           description: "Juega 100 comodines en total.",                  icon: "star",             iconColor: "#A855F7", target: 100,   coinsReward: 400,  xpReward: 1000,  rarity: "legendary" },
  { id: "j_game_5",         title: "Bloqueador Élite",           description: "Juega 5 Jotas en una sola partida.",             icon: "hand-left",        iconColor: "#27AE60", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "ace_block",        title: "As Bloqueador",              description: "Usa un As para bloquear una cadena de robos.",   icon: "shield",           iconColor: "#1A8FC1", target: 1,     coinsReward: 30,   xpReward: 75,    rarity: "rare", hidden: true },
  // Hand quality expansion
  { id: "perfect_hand_3",   title: "Perfección x3",              description: "Gana sin robar cartas 3 veces.",                 icon: "sparkles",         iconColor: "#1A8FC1", target: 3,     coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "perfect_hand_10",  title: "Perfección x10",             description: "Gana sin robar cartas 10 veces.",                icon: "sparkles",         iconColor: "#D4AF37", target: 10,    coinsReward: 400,  xpReward: 1000,  rarity: "legendary" },
  { id: "comeback_3",       title: "Regresa Siempre",            description: "Gana con 10+ cartas en mano 3 veces.",           icon: "arrow-up-circle",  iconColor: "#27AE60", target: 3,     coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "comeback_10",      title: "El Rey del Regreso",         description: "Gana con 10+ cartas en mano 10 veces.",          icon: "arrow-up-circle",  iconColor: "#D4AF37", target: 10,    coinsReward: 300,  xpReward: 800,   rarity: "legendary" },
  { id: "speed_1m",         title: "Un Minuto Exacto",           description: "Gana una partida en menos de 1 minuto.",         icon: "speedometer",      iconColor: "#FFD700", target: 1,     coinsReward: 80,   xpReward: 200,   rarity: "epic", hidden: true },
  { id: "no_special_5",     title: "Sin Poderes x5",             description: "Gana sin cartas especiales 5 veces.",            icon: "close-circle",     iconColor: "#D4AF37", target: 5,     coinsReward: 250,  xpReward: 600,   rarity: "legendary" },
  { id: "marathon_15m",     title: "Maratonista Serio",          description: "Juega una partida de más de 15 minutos.",        icon: "time",             iconColor: "#9B59B6", target: 1,     coinsReward: 30,   xpReward: 75,    rarity: "rare" },
  { id: "marathon_25m",     title: "Resistencia Total",          description: "Juega una partida de más de 25 minutos.",        icon: "time",             iconColor: "#A855F7", target: 1,     coinsReward: 80,   xpReward: 200,   rarity: "epic" },
  // Coins expansion
  { id: "collector_2000",   title: "Banquero",                   description: "Acumula 2000 monedas.",                          icon: "wallet",           iconColor: "#27AE60", target: 2000,  coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "collector_5000",   title: "Empresario",                 description: "Acumula 5000 monedas.",                          icon: "wallet",           iconColor: "#E67E22", target: 5000,  coinsReward: 300,  xpReward: 750,   rarity: "epic" },
  { id: "collector_10000",  title: "Magnate",                    description: "Acumula 10000 monedas.",                         icon: "diamond",          iconColor: "#D4AF37", target: 10000, coinsReward: 800,  xpReward: 2000,  rarity: "legendary" },
  { id: "big_spender_1000", title: "Derrochador",                description: "Gasta 1000 monedas en total.",                   icon: "bag-add",          iconColor: "#9B59B6", target: 1000,  coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "big_spender_5000", title: "Magnate Gastador",           description: "Gasta 5000 monedas en total.",                   icon: "bag",              iconColor: "#A855F7", target: 5000,  coinsReward: 300,  xpReward: 800,   rarity: "epic" },
  // Streaks expansion
  { id: "daily_streak_90",  title: "Tres Meses Firme",           description: "Juega 90 días seguidos.",                        icon: "trophy",           iconColor: "#E74C3C", target: 90,    coinsReward: 1500, xpReward: 4000,  rarity: "legendary" },
  { id: "daily_streak_180", title: "Medio Año Imparable",        description: "Juega 180 días seguidos.",                       icon: "infinite",         iconColor: "#D4AF37", target: 180,   coinsReward: 3000, xpReward: 8000,  rarity: "legendary" },
  { id: "daily_streak_365", title: "Un Año de Gloria",           description: "Juega 365 días seguidos.",                       icon: "diamond",          iconColor: "#FFD700", target: 365,   coinsReward: 5000, xpReward: 15000, rarity: "legendary" },
  // Store expansion
  { id: "collector_items90",title: "Colección Total",            description: "Posee 90 artículos de la tienda.",                icon: "trophy",           iconColor: "#D4AF37", target: 90,    coinsReward: 2500, xpReward: 6000,  rarity: "legendary" },
  { id: "avatar_collector_30",title:"Avatar Fanático",           description: "Posee 30 avatares diferentes.",                   icon: "person-circle",    iconColor: "#E74C3C", target: 30,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "frame_collector_25",title:"Enmarcador Élite",           description: "Posee 25 marcos diferentes.",                     icon: "square",           iconColor: "#A855F7", target: 25,    coinsReward: 150,  xpReward: 400,   rarity: "epic" },
  { id: "title_collector_10",title:"Títulos al Poder",           description: "Posee 10 títulos diferentes.",                    icon: "ribbon",           iconColor: "#D4AF37", target: 10,    coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "effect_collector", title: "Efecto Master",              description: "Posee 10 efectos visuales distintos.",            icon: "sparkles",         iconColor: "#A855F7", target: 10,    coinsReward: 150,  xpReward: 400,   rarity: "rare" },
  { id: "store_addict",     title: "Adicto a la Tienda",         description: "Compra 50 artículos en la tienda.",               icon: "cart",             iconColor: "#E74C3C", target: 50,    coinsReward: 500,  xpReward: 1200,  rarity: "epic" },
  // Difficulty expansion
  { id: "hard_win_5",       title: "Gladiador Veterano",         description: "Gana 5 partidas en dificultad Difícil.",         icon: "shield",           iconColor: "#9B59B6", target: 5,     coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "hard_win_25",      title: "Maestro Difícil",            description: "Gana 25 partidas en dificultad Difícil.",        icon: "shield",           iconColor: "#D4AF37", target: 25,    coinsReward: 400,  xpReward: 1000,  rarity: "epic" },
  { id: "expert_25",        title: "Experto Veterano",           description: "Gana 25 partidas en modo Experto.",              icon: "timer",            iconColor: "#E67E22", target: 25,    coinsReward: 600,  xpReward: 1500,  rarity: "legendary" },
  { id: "expert_50",        title: "Maestro Experto",            description: "Gana 50 partidas en modo Experto.",              icon: "timer",            iconColor: "#E74C3C", target: 50,    coinsReward: 1200, xpReward: 3000,  rarity: "legendary" },
  { id: "expert_100",       title: "El Gran Experto",            description: "Gana 100 partidas en modo Experto.",             icon: "timer",            iconColor: "#A855F7", target: 100,   coinsReward: 2500, xpReward: 7000,  rarity: "legendary" },
  { id: "expert_no_draw",   title: "Sin Robar en Experto",       description: "Gana en modo Experto sin robar ninguna carta.", icon: "shield-checkmark", iconColor: "#FFD700", target: 1,     coinsReward: 300,  xpReward: 800,   rarity: "legendary", hidden: true },
  // Multiplayer expansion
  { id: "multi_win_25",     title: "Veterano Local",             description: "Gana 25 partidas multijugador local.",           icon: "people",           iconColor: "#9B59B6", target: 25,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "multi_win_50",     title: "Señor de la Mesa",           description: "Gana 50 partidas multijugador local.",           icon: "ribbon",           iconColor: "#D4AF37", target: 50,    coinsReward: 500,  xpReward: 1200,  rarity: "legendary" },
  { id: "multi_win_100",    title: "Leyenda Local",              description: "Gana 100 partidas multijugador local.",          icon: "trophy",           iconColor: "#FF4400", target: 100,   coinsReward: 1200, xpReward: 3000,  rarity: "legendary" },
  { id: "online_win_25",    title: "Pro Online Veterano",        description: "Gana 25 partidas online.",                       icon: "globe",            iconColor: "#9B59B6", target: 25,    coinsReward: 300,  xpReward: 800,   rarity: "epic" },
  { id: "online_win_50",    title: "Elite Online",               description: "Gana 50 partidas online.",                       icon: "diamond",          iconColor: "#D4AF37", target: 50,    coinsReward: 700,  xpReward: 1800,  rarity: "legendary" },
  { id: "online_win_100",   title: "Leyenda de la Red",          description: "Gana 100 partidas online.",                      icon: "infinite",         iconColor: "#FFD700", target: 100,   coinsReward: 1500, xpReward: 4000,  rarity: "legendary" },
  { id: "multi_sessions_50",title: "Social Comprometido",        description: "Juega 50 partidas multijugador.",                 icon: "people-circle",    iconColor: "#E67E22", target: 50,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "multi_sessions_100",title:"Ultra Social",               description: "Juega 100 partidas multijugador.",                icon: "people-circle",    iconColor: "#A855F7", target: 100,   coinsReward: 500,  xpReward: 1200,  rarity: "legendary" },
  // XP / Level expansion
  { id: "xp_500",           title: "Primer XP",                  description: "Gana 500 XP en total.",                          icon: "star",             iconColor: "#95A5A6", target: 500,   coinsReward: 15,   xpReward: 0,     rarity: "common" },
  { id: "xp_5000",          title: "Subiendo Fuerte",            description: "Gana 5000 XP en total.",                         icon: "star",             iconColor: "#1A8FC1", target: 5000,  coinsReward: 60,   xpReward: 0,     rarity: "common" },
  { id: "xp_25000",         title: "Imparable en XP",            description: "Gana 25000 XP en total.",                        icon: "star",             iconColor: "#E67E22", target: 25000, coinsReward: 200,  xpReward: 0,     rarity: "rare" },
  { id: "xp_200000",        title: "Monstruo de XP",             description: "Gana 200000 XP en total.",                       icon: "diamond",          iconColor: "#9B59B6", target: 200000,coinsReward: 600,  xpReward: 0,     rarity: "epic" },
  { id: "xp_500000",        title: "XP Legendario",              description: "Gana 500000 XP en total.",                       icon: "diamond",          iconColor: "#D4AF37", target: 500000,coinsReward: 1500, xpReward: 0,     rarity: "legendary" },
  { id: "level_5",          title: "Nivel 5",                    description: "Alcanza el nivel 5.",                            icon: "star",             iconColor: "#95A5A6", target: 5,     coinsReward: 20,   xpReward: 0,     rarity: "common" },
  { id: "level_10",         title: "Nivel 10",                   description: "Alcanza el nivel 10.",                           icon: "star",             iconColor: "#1A8FC1", target: 10,    coinsReward: 50,   xpReward: 0,     rarity: "common" },
  { id: "level_25",         title: "Nivel 25",                   description: "Alcanza el nivel 25.",                           icon: "ribbon",           iconColor: "#27AE60", target: 25,    coinsReward: 150,  xpReward: 0,     rarity: "rare" },
  { id: "level_75",         title: "Nivel 75",                   description: "Alcanza el nivel 75.",                           icon: "trophy",           iconColor: "#E74C3C", target: 75,    coinsReward: 800,  xpReward: 0,     rarity: "epic" },
  { id: "level_99",         title: "Nivel Máximo",               description: "Alcanza el nivel 99.",                           icon: "infinite",         iconColor: "#D4AF37", target: 99,    coinsReward: 5000, xpReward: 0,     rarity: "legendary" },
  // Battle Pass expansion
  { id: "bp_tier_150",      title: "Pase de Batalla Épico",      description: "Alcanza el nivel 150 del Pase de Batalla.",     icon: "medal",            iconColor: "#9B59B6", target: 150,   coinsReward: 500,  xpReward: 1200,  rarity: "epic" },
  { id: "bp_tier_200",      title: "Pase de Batalla Legendario", description: "Alcanza el nivel 200 del Pase de Batalla.",     icon: "trophy",           iconColor: "#D4AF37", target: 200,   coinsReward: 1200, xpReward: 3000,  rarity: "legendary" },
  { id: "bp_tier_250",      title: "Pase de Batalla Supremo",    description: "Alcanza el nivel 250 del Pase de Batalla.",     icon: "diamond",          iconColor: "#FF4400", target: 250,   coinsReward: 2500, xpReward: 6000,  rarity: "legendary" },
  { id: "bp_tier_300",      title: "Pase de Batalla Divino",     description: "Alcanza el nivel 300 del Pase de Batalla.",     icon: "infinite",         iconColor: "#A855F7", target: 300,   coinsReward: 5000, xpReward: 12000, rarity: "legendary" },
  // Cards played expansion
  { id: "cards_played_2000",title: "Baraja Incansable",          description: "Juega 2000 cartas en total.",                    icon: "layers",           iconColor: "#9B59B6", target: 2000,  coinsReward: 300,  xpReward: 800,   rarity: "epic" },
  { id: "cards_played_5000",title: "La Mano que Nunca Para",     description: "Juega 5000 cartas en total.",                    icon: "infinite",         iconColor: "#D4AF37", target: 5000,  coinsReward: 600,  xpReward: 1500,  rarity: "legendary" },
  { id: "cards_played_10000",title:"Maestro Baraja Supremo",     description: "Juega 10000 cartas en total.",                   icon: "infinite",         iconColor: "#FF4400", target: 10000, coinsReward: 1500, xpReward: 4000,  rarity: "legendary" },
  { id: "cards_played_50000",title:"Dios de las Cartas",         description: "Juega 50000 cartas en total.",                   icon: "diamond",          iconColor: "#A855F7", target: 50000, coinsReward: 5000, xpReward: 12000, rarity: "legendary" },
  // Win streak expansion
  { id: "win_7_streak",     title: "Siete Seguidas",             description: "Gana 7 partidas seguidas.",                     icon: "flash",            iconColor: "#9B59B6", target: 7,     coinsReward: 120,  xpReward: 300,   rarity: "epic" },
  { id: "win_15_streak",    title: "Quince sin Perder",          description: "Gana 15 partidas seguidas.",                    icon: "trophy",           iconColor: "#D4AF37", target: 15,    coinsReward: 400,  xpReward: 1000,  rarity: "legendary", hidden: true },
  { id: "win_20_streak",    title: "Máquina Perfecta",           description: "Gana 20 partidas seguidas.",                    icon: "infinite",         iconColor: "#FF4400", target: 20,    coinsReward: 1000, xpReward: 3000,  rarity: "legendary", hidden: true },
  // Emote system
  { id: "emote_first",      title: "Primer Emote",               description: "Usa un emote por primera vez.",                  icon: "happy",            iconColor: "#27AE60", target: 1,     coinsReward: 10,   xpReward: 25,    rarity: "common" },
  { id: "emote_5",          title: "Expresivo",                  description: "Usa 5 emotes en una partida.",                   icon: "happy",            iconColor: "#1A8FC1", target: 1,     coinsReward: 20,   xpReward: 50,    rarity: "common" },
  { id: "emote_25",         title: "Emoticón Activo",            description: "Usa 25 emotes en total.",                        icon: "happy",            iconColor: "#E67E22", target: 25,    coinsReward: 40,   xpReward: 100,   rarity: "rare" },
  { id: "emote_100",        title: "Rey de los Emotes",          description: "Usa 100 emotes en total.",                       icon: "happy",            iconColor: "#D4AF37", target: 100,   coinsReward: 100,  xpReward: 250,   rarity: "epic" },
  // Daily rewards
  { id: "daily_reward_7",   title: "Semana de Recompensas",      description: "Reclama 7 recompensas diarias.",                 icon: "calendar",         iconColor: "#27AE60", target: 7,     coinsReward: 30,   xpReward: 75,    rarity: "common" },
  { id: "daily_reward_30",  title: "Mes de Recompensas",         description: "Reclama 30 recompensas diarias.",                icon: "calendar",         iconColor: "#1A8FC1", target: 30,    coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "daily_reward_100", title: "100 Recompensas Diarias",    description: "Reclama 100 recompensas diarias.",               icon: "calendar",         iconColor: "#D4AF37", target: 100,   coinsReward: 400,  xpReward: 1000,  rarity: "epic" },
  { id: "daily_reward_365", title: "Un Año de Recompensas",      description: "Reclama 365 recompensas diarias.",               icon: "calendar",         iconColor: "#A855F7", target: 365,   coinsReward: 2000, xpReward: 5000,  rarity: "legendary" },
  // Audio/Settings
  { id: "mute_toggle",      title: "Silencioso",                 description: "Activa o desactiva el sonido.",                  icon: "volume-mute",      iconColor: "#95A5A6", target: 1,     coinsReward: 5,    xpReward: 10,    rarity: "common" },
  { id: "sound_all_on",     title: "Todo al Máximo",             description: "Activa todos los sonidos del juego.",            icon: "volume-high",      iconColor: "#27AE60", target: 1,     coinsReward: 10,   xpReward: 25,    rarity: "common" },
  { id: "audio_lover",      title: "Amante del Audio",           description: "Juega 50 partidas con todos los sonidos activos.", icon: "musical-notes",  iconColor: "#E67E22", target: 50,    coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  // Special wins
  { id: "tournament_perfect",title:"Torneo Sin Derrota",         description: "Gana un torneo sin perder ninguna ronda.",        icon: "trophy",           iconColor: "#FFD700", target: 1,     coinsReward: 200,  xpReward: 500,   rarity: "epic", hidden: true },
  { id: "domination_5",     title: "Dominación Cinco",           description: "Gana 5 partidas en Difícil sin robar.",          icon: "flash",            iconColor: "#A855F7", target: 5,     coinsReward: 600,  xpReward: 1500,  rarity: "legendary", hidden: true },
  { id: "perfect_streak",   title: "Perfectas Seguidas",         description: "Gana 3 partidas perfectas consecutivas.",        icon: "sparkles",         iconColor: "#FFD700", target: 3,     coinsReward: 300,  xpReward: 800,   rarity: "legendary", hidden: true },
  { id: "clutch_king",      title: "Rey del Clutch",             description: "Gana 10 partidas cuando estabas perdiendo.",     icon: "arrow-up-circle",  iconColor: "#E74C3C", target: 10,    coinsReward: 500,  xpReward: 1200,  rarity: "legendary" },
  // Gameplay specific expansion
  { id: "wild_frenzy_3",    title: "Trifuerza de Ochos",         description: "Juega 3+ ochos locos en 3 partidas distintas.",  icon: "infinite",         iconColor: "#E67E22", target: 3,     coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "j_spam_5",         title: "Spam de Jotas",              description: "Juega 5+ Jotas en 5 partidas distintas.",        icon: "hand-left",        iconColor: "#27AE60", target: 5,     coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "seven_trap_3",     title: "Maestro del 7",              description: "Atrapa al rival con el 7 en 3 partidas.",        icon: "thunderstorm",     iconColor: "#D4AF37", target: 3,     coinsReward: 150,  xpReward: 400,   rarity: "epic" },
  { id: "two_chain_3",      title: "Maestro del 2",              description: "Encadena cartas 2 en 3 partidas.",               icon: "link",             iconColor: "#E74C3C", target: 3,     coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "joker_comeback",   title: "Comodín al Rescate",         description: "Gana con un Comodín desde una posición mala.",   icon: "star",             iconColor: "#FF6B00", target: 1,     coinsReward: 120,  xpReward: 300,   rarity: "epic", hidden: true },
  { id: "perfect_eight",    title: "Ocho Perfecto",              description: "Juega 8 ochos locos en una sola partida.",       icon: "infinite",         iconColor: "#A855F7", target: 1,     coinsReward: 300,  xpReward: 800,   rarity: "legendary", hidden: true },
  { id: "defensive_master", title: "Maestro Defensivo",          description: "Bloquea 20 robos con Ases en total.",            icon: "shield-checkmark", iconColor: "#1A8FC1", target: 20,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "offensive_master", title: "Maestro Ofensivo",           description: "Fuerza 20 robos al rival con 2 o 7.",            icon: "layers",           iconColor: "#E74C3C", target: 20,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "rainbow_win",      title: "Arcoíris",                   description: "Gana usando cartas de los 4 palos.",             icon: "color-palette",    iconColor: "#FF69B4", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "last_card_win",    title: "La Última Carta",            description: "Gana con la última carta siendo especial.",      icon: "star",             iconColor: "#FFD700", target: 1,     coinsReward: 80,   xpReward: 200,   rarity: "epic", hidden: true },
  // Time-based expansion
  { id: "early_bird_5",     title: "Madrugador Constante",       description: "Gana 5 partidas antes de las 8 AM.",             icon: "sunny",            iconColor: "#E67E22", target: 5,     coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "night_owl_5",      title: "Búho de la Medianoche",      description: "Gana 5 partidas después de la medianoche.",      icon: "moon",             iconColor: "#4A90E2", target: 5,     coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "weekend_warrior_5",title: "Guerrero de Fin de Semana",  description: "Gana 50 partidas en fines de semana.",           icon: "calendar",         iconColor: "#D4AF37", target: 50,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "speed_45s",        title: "45 Segundos",                description: "Gana una partida en menos de 45 segundos.",      icon: "flash",            iconColor: "#E74C3C", target: 1,     coinsReward: 200,  xpReward: 500,   rarity: "legendary", hidden: true },
  { id: "marathon_30m",     title: "Ultramaratón",               description: "Juega una partida de más de 30 minutos.",        icon: "time",             iconColor: "#D4AF37", target: 1,     coinsReward: 100,  xpReward: 250,   rarity: "epic" },
  // Language expansion
  { id: "all_languages",    title: "Trilingüe",                  description: "Juega en los 3 idiomas disponibles.",            icon: "language",         iconColor: "#D4AF37", target: 3,     coinsReward: 80,   xpReward: 200,   rarity: "epic" },
  { id: "spanish_player",   title: "¡Español al 100!",           description: "Juega 30 partidas en Español.",                  icon: "language",         iconColor: "#E74C3C", target: 30,    coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "english_player",   title: "English Gamer",              description: "Play 30 games in English.",                      icon: "language",         iconColor: "#1A8FC1", target: 30,    coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  // Customization
  { id: "legendary_back",   title: "Dorso Legendario",           description: "Equipa un dorso de cartas legendario.",          icon: "card",             iconColor: "#D4AF37", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "legendary_avatar", title: "Avatar Legendario",          description: "Equipa un avatar legendario.",                   icon: "person-circle",    iconColor: "#D4AF37", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "legendary_frame",  title: "Marco Legendario",           description: "Equipa un marco legendario.",                    icon: "square",           iconColor: "#D4AF37", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "legendary_effect", title: "Efecto Legendario",          description: "Equipa un efecto visual legendario.",            icon: "sparkles",         iconColor: "#D4AF37", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "legendary_title",  title: "Título Legendario",          description: "Equipa un título legendario.",                   icon: "ribbon",           iconColor: "#D4AF37", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "full_legendary_set",title:"Set Legendario Completo",    description: "Equipa los 5 artículos legendarios a la vez.",   icon: "diamond",          iconColor: "#A855F7", target: 1,     coinsReward: 500,  xpReward: 1500,  rarity: "legendary", hidden: true },
  // Rarity collection
  { id: "rare_collector_5", title: "Colector de Rarezas",        description: "Posee 5 artículos raros.",                       icon: "albums",           iconColor: "#2196F3", target: 5,     coinsReward: 30,   xpReward: 75,    rarity: "rare" },
  { id: "epic_collector_3", title: "Colector Épico",             description: "Posee 3 artículos épicos.",                      icon: "diamond",          iconColor: "#9B59B6", target: 3,     coinsReward: 80,   xpReward: 200,   rarity: "epic" },
  { id: "legendary_collector_1",title:"Primera Legendaria",      description: "Posee tu primer artículo legendario.",           icon: "star",             iconColor: "#D4AF37", target: 1,     coinsReward: 100,  xpReward: 300,   rarity: "epic" },
  { id: "legendary_collector_3",title:"Tres Legendarias",        description: "Posee 3 artículos legendarios.",                 icon: "star",             iconColor: "#D4AF37", target: 3,     coinsReward: 300,  xpReward: 800,   rarity: "legendary" },
  { id: "legendary_collector_5",title:"Cinco Legendarias",       description: "Posee 5 artículos legendarios.",                 icon: "diamond",          iconColor: "#A855F7", target: 5,     coinsReward: 800,  xpReward: 2000,  rarity: "legendary" },
  // Wild 8 mastery
  { id: "eight_redirect_10",title: "10 Cambios de Palo",         description: "Cambia el palo activo 10 veces con el ocho.",    icon: "shuffle",          iconColor: "#1A8FC1", target: 10,    coinsReward: 30,   xpReward: 75,    rarity: "common" },
  { id: "eight_redirect_50",title: "50 Cambios de Palo",         description: "Cambia el palo activo 50 veces con el ocho.",    icon: "shuffle",          iconColor: "#9B59B6", target: 50,    coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "eight_game_3",     title: "Trío de Ochos",              description: "Juega 3 ochos locos en una sola partida.",       icon: "infinite",         iconColor: "#E67E22", target: 1,     coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "eight_game_5",     title: "Quinteto de Ochos",          description: "Juega 5 ochos locos en una sola partida.",       icon: "infinite",         iconColor: "#D4AF37", target: 1,     coinsReward: 200,  xpReward: 500,   rarity: "epic", hidden: true },
  // Ocho calls
  { id: "ocho_call_10",     title: "¡10 veces Ocho!",            description: "Llama '¡Ocho!' 10 veces en total.",              icon: "megaphone",        iconColor: "#FFD700", target: 10,    coinsReward: 20,   xpReward: 50,    rarity: "common" },
  { id: "ocho_call_50",     title: "Locutor de Ocho",            description: "Llama '¡Ocho!' 50 veces en total.",              icon: "megaphone",        iconColor: "#E67E22", target: 50,    coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "ocho_call_100",    title: "El Gran Anunciador",         description: "Llama '¡Ocho!' 100 veces en total.",             icon: "megaphone",        iconColor: "#D4AF37", target: 100,   coinsReward: 150,  xpReward: 400,   rarity: "epic" },
  { id: "ocho_master",      title: "Maestro del Ocho",           description: "Llama '¡Ocho!' en 10 partidas consecutivas.",    icon: "trophy",           iconColor: "#A855F7", target: 10,    coinsReward: 400,  xpReward: 1000,  rarity: "legendary" },
  // Level extra
  { id: "level_50_wins",    title: "50 Victorias por Nivel",     description: "Gana 50 partidas en cualquier nivel.",           icon: "trending-up",      iconColor: "#27AE60", target: 50,    coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  // Expert extras
  { id: "expert_no_timeout",title: "Sin Tiempo Límite",          description: "Gana 5 partidas Experto sin que se acabe el tiempo.", icon: "timer",        iconColor: "#9B59B6", target: 5,     coinsReward: 300,  xpReward: 800,   rarity: "epic" },
  { id: "expert_masterclass",title:"Clase Magistral Experto",    description: "Gana 25 partidas Experto perfectas.",             icon: "school",           iconColor: "#D4AF37", target: 25,    coinsReward: 1000, xpReward: 3000,  rarity: "legendary" },
  { id: "expert_streak_5",  title: "5 Seguidas en Experto",      description: "Gana 5 partidas Experto consecutivas.",           icon: "flash",            iconColor: "#E74C3C", target: 5,     coinsReward: 500,  xpReward: 1200,  rarity: "legendary", hidden: true },
  // Social
  { id: "emote_master_full",title: "Maestro de Emotes",          description: "Usa todos los tipos de emote disponibles.",       icon: "happy",            iconColor: "#9B59B6", target: 1,     coinsReward: 100,  xpReward: 250,   rarity: "epic" },
  { id: "silent_champion",  title: "Campeón Silencioso",         description: "Gana 20 partidas sin usar ningún emote.",        icon: "volume-mute",      iconColor: "#95A5A6", target: 20,    coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  // Battle pass collection
  { id: "bp_collector_10",  title: "10 Premios del Pase",        description: "Reclama 10 recompensas del Pase de Batalla.",    icon: "gift",             iconColor: "#1A8FC1", target: 10,    coinsReward: 50,   xpReward: 120,   rarity: "common" },
  { id: "bp_collector_50",  title: "50 Premios del Pase",        description: "Reclama 50 recompensas del Pase de Batalla.",    icon: "gift",             iconColor: "#D4AF37", target: 50,    coinsReward: 200,  xpReward: 500,   rarity: "rare" },
  { id: "bp_collector_100", title: "100 Premios del Pase",       description: "Reclama 100 recompensas del Pase de Batalla.",   icon: "gift",             iconColor: "#A855F7", target: 100,   coinsReward: 600,  xpReward: 1500,  rarity: "epic" },
  // Comeback milestones
  { id: "epic_comeback_3",  title: "Epico Regreso x3",           description: "Regresa de 15+ cartas 3 veces.",                 icon: "arrow-up-circle",  iconColor: "#E74C3C", target: 3,     coinsReward: 200,  xpReward: 500,   rarity: "epic", hidden: true },
  { id: "ultimate_comeback",title: "Regreso Definitivo",         description: "Gana desde 20+ cartas en mano.",                 icon: "arrow-up",         iconColor: "#D4AF37", target: 1,     coinsReward: 500,  xpReward: 1500,  rarity: "legendary", hidden: true },
  { id: "miracle_win",      title: "Victoria Milagrosa",         description: "Gana con 18+ cartas en mano.",                   icon: "star",             iconColor: "#FFD700", target: 1,     coinsReward: 300,  xpReward: 800,   rarity: "legendary", hidden: true },
  // Challenge expansion
  { id: "challenge_streak_3",title:"Racha de Desafíos",          description: "Gana 3 desafíos seguidos.",                      icon: "flash",            iconColor: "#E67E22", target: 3,     coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "challenge_master_50",title:"Maestro Desafiante",        description: "Completa 50 desafíos.",                          icon: "checkbox",         iconColor: "#9B59B6", target: 50,    coinsReward: 300,  xpReward: 800,   rarity: "epic" },
  { id: "challenge_legend", title: "Leyenda de los Desafíos",    description: "Completa 100 desafíos.",                         icon: "trophy",           iconColor: "#D4AF37", target: 100,   coinsReward: 1000, xpReward: 3000,  rarity: "legendary" },
  // Collectors
  { id: "coin_millionaire", title: "Millonario de Monedas",      description: "Acumula 100000 monedas en toda tu vida.",        icon: "diamond",          iconColor: "#D4AF37", target: 100000,coinsReward: 2000, xpReward: 5000,  rarity: "legendary" },
  { id: "coin_spender_master",title:"Gastador Supremo",          description: "Gasta 10000 monedas en total.",                  icon: "bag",              iconColor: "#A855F7", target: 10000, coinsReward: 1000, xpReward: 2500,  rarity: "legendary" },
  // Pattern wins
  { id: "all_same_suit",    title: "Monocolor",                  description: "Gana usando cartas de un solo palo.",            icon: "color-palette",    iconColor: "#9B59B6", target: 1,     coinsReward: 100,  xpReward: 250,   rarity: "epic", hidden: true },
  { id: "multisuit_win",    title: "Cuatro Palos",               description: "Juega cartas de los 4 palos en una partida.",    icon: "shuffle",          iconColor: "#E67E22", target: 1,     coinsReward: 40,   xpReward: 100,   rarity: "rare" },
  // Tournament
  { id: "tournament_champion_25",title:"Campeón de 25 Torneos",  description: "Gana 25 torneos en total.",                      icon: "diamond",          iconColor: "#A855F7", target: 25,    coinsReward: 1000, xpReward: 2500,  rarity: "legendary" },
  // Comeback
  { id: "never_give_up",    title: "Nunca Rendirse",             description: "Gana 5 partidas cuando tenías más cartas.",      icon: "arrow-up",         iconColor: "#27AE60", target: 5,     coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "extra_win_1", title: "Conquistador 1000", description: "Gana 1000 partidas en total.", icon: "trophy", iconColor: "#A855F7", target: 1000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_2", title: "Conquistador 2000", description: "Gana 2000 partidas en total.", icon: "trophy", iconColor: "#FF6B00", target: 2000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_3", title: "Conquistador 3000", description: "Gana 3000 partidas en total.", icon: "trophy", iconColor: "#9B59B6", target: 3000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_4", title: "Conquistador 4000", description: "Gana 4000 partidas en total.", icon: "trophy", iconColor: "#D4AF37", target: 4000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_5", title: "Conquistador 5000", description: "Gana 5000 partidas en total.", icon: "trophy", iconColor: "#FFD700", target: 5000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_6", title: "Conquistador 6000", description: "Gana 6000 partidas en total.", icon: "trophy", iconColor: "#1A8FC1", target: 6000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_7", title: "Conquistador 7000", description: "Gana 7000 partidas en total.", icon: "trophy", iconColor: "#E67E22", target: 7000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_8", title: "Conquistador 16000", description: "Gana 16000 partidas en total.", icon: "trophy", iconColor: "#E74C3C", target: 16000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_9", title: "Conquistador 18000", description: "Gana 18000 partidas en total.", icon: "trophy", iconColor: "#9B59B6", target: 18000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_10", title: "Conquistador 20000", description: "Gana 20000 partidas en total.", icon: "trophy", iconColor: "#E67E22", target: 20000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_11", title: "Conquistador 22000", description: "Gana 22000 partidas en total.", icon: "trophy", iconColor: "#A855F7", target: 22000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_12", title: "Conquistador 24000", description: "Gana 24000 partidas en total.", icon: "trophy", iconColor: "#FF6B00", target: 24000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_13", title: "Conquistador 26000", description: "Gana 26000 partidas en total.", icon: "trophy", iconColor: "#E74C3C", target: 26000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_14", title: "Conquistador 28000", description: "Gana 28000 partidas en total.", icon: "trophy", iconColor: "#FFD700", target: 28000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_15", title: "Conquistador 45000", description: "Gana 45000 partidas en total.", icon: "trophy", iconColor: "#9B59B6", target: 45000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_16", title: "Conquistador 48000", description: "Gana 48000 partidas en total.", icon: "trophy", iconColor: "#9B59B6", target: 48000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_17", title: "Conquistador 51000", description: "Gana 51000 partidas en total.", icon: "trophy", iconColor: "#27AE60", target: 51000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_18", title: "Conquistador 54000", description: "Gana 54000 partidas en total.", icon: "trophy", iconColor: "#1A8FC1", target: 54000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_19", title: "Conquistador 57000", description: "Gana 57000 partidas en total.", icon: "trophy", iconColor: "#9B59B6", target: 57000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_20", title: "Conquistador 60000", description: "Gana 60000 partidas en total.", icon: "trophy", iconColor: "#1A8FC1", target: 60000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_21", title: "Conquistador 63000", description: "Gana 63000 partidas en total.", icon: "trophy", iconColor: "#1A8FC1", target: 63000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_22", title: "Conquistador 88000", description: "Gana 88000 partidas en total.", icon: "trophy", iconColor: "#E67E22", target: 88000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_23", title: "Conquistador 92000", description: "Gana 92000 partidas en total.", icon: "trophy", iconColor: "#A855F7", target: 92000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_24", title: "Conquistador 96000", description: "Gana 96000 partidas en total.", icon: "trophy", iconColor: "#E74C3C", target: 96000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_25", title: "Conquistador 100000", description: "Gana 100000 partidas en total.", icon: "trophy", iconColor: "#D4AF37", target: 100000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_26", title: "Conquistador 104000", description: "Gana 104000 partidas en total.", icon: "trophy", iconColor: "#C0C0C0", target: 104000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_27", title: "Conquistador 108000", description: "Gana 108000 partidas en total.", icon: "trophy", iconColor: "#C0C0C0", target: 108000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_28", title: "Conquistador 112000", description: "Gana 112000 partidas en total.", icon: "trophy", iconColor: "#9B59B6", target: 112000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_29", title: "Conquistador 145000", description: "Gana 145000 partidas en total.", icon: "trophy", iconColor: "#E74C3C", target: 145000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_30", title: "Conquistador 150000", description: "Gana 150000 partidas en total.", icon: "trophy", iconColor: "#A855F7", target: 150000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_31", title: "Conquistador 155000", description: "Gana 155000 partidas en total.", icon: "trophy", iconColor: "#A855F7", target: 155000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_32", title: "Conquistador 160000", description: "Gana 160000 partidas en total.", icon: "trophy", iconColor: "#9B59B6", target: 160000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_33", title: "Conquistador 165000", description: "Gana 165000 partidas en total.", icon: "trophy", iconColor: "#27AE60", target: 165000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_34", title: "Conquistador 170000", description: "Gana 170000 partidas en total.", icon: "trophy", iconColor: "#A855F7", target: 170000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_35", title: "Conquistador 175000", description: "Gana 175000 partidas en total.", icon: "trophy", iconColor: "#1A8FC1", target: 175000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_36", title: "Conquistador 216000", description: "Gana 216000 partidas en total.", icon: "trophy", iconColor: "#9B59B6", target: 216000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_37", title: "Conquistador 222000", description: "Gana 222000 partidas en total.", icon: "trophy", iconColor: "#9B59B6", target: 222000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_38", title: "Conquistador 228000", description: "Gana 228000 partidas en total.", icon: "trophy", iconColor: "#E74C3C", target: 228000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_39", title: "Conquistador 234000", description: "Gana 234000 partidas en total.", icon: "trophy", iconColor: "#FFD700", target: 234000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_40", title: "Conquistador 240000", description: "Gana 240000 partidas en total.", icon: "trophy", iconColor: "#1A8FC1", target: 240000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_41", title: "Conquistador 246000", description: "Gana 246000 partidas en total.", icon: "trophy", iconColor: "#D4AF37", target: 246000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_42", title: "Conquistador 252000", description: "Gana 252000 partidas en total.", icon: "trophy", iconColor: "#27AE60", target: 252000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_43", title: "Conquistador 301000", description: "Gana 301000 partidas en total.", icon: "trophy", iconColor: "#A855F7", target: 301000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_44", title: "Conquistador 308000", description: "Gana 308000 partidas en total.", icon: "trophy", iconColor: "#E67E22", target: 308000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_45", title: "Conquistador 315000", description: "Gana 315000 partidas en total.", icon: "trophy", iconColor: "#FF6B00", target: 315000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_46", title: "Conquistador 322000", description: "Gana 322000 partidas en total.", icon: "trophy", iconColor: "#E74C3C", target: 322000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_47", title: "Conquistador 329000", description: "Gana 329000 partidas en total.", icon: "trophy", iconColor: "#FF6B00", target: 329000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_48", title: "Conquistador 336000", description: "Gana 336000 partidas en total.", icon: "trophy", iconColor: "#27AE60", target: 336000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_49", title: "Conquistador 343000", description: "Gana 343000 partidas en total.", icon: "trophy", iconColor: "#E74C3C", target: 343000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_50", title: "Conquistador 400000", description: "Gana 400000 partidas en total.", icon: "trophy", iconColor: "#9B59B6", target: 400000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_51", title: "Conquistador 408000", description: "Gana 408000 partidas en total.", icon: "trophy", iconColor: "#C0C0C0", target: 408000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_52", title: "Conquistador 416000", description: "Gana 416000 partidas en total.", icon: "trophy", iconColor: "#C0C0C0", target: 416000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_53", title: "Conquistador 424000", description: "Gana 424000 partidas en total.", icon: "trophy", iconColor: "#E74C3C", target: 424000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_54", title: "Conquistador 432000", description: "Gana 432000 partidas en total.", icon: "trophy", iconColor: "#FFD700", target: 432000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_55", title: "Conquistador 440000", description: "Gana 440000 partidas en total.", icon: "trophy", iconColor: "#FFD700", target: 440000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_56", title: "Conquistador 448000", description: "Gana 448000 partidas en total.", icon: "trophy", iconColor: "#FF6B00", target: 448000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_57", title: "Conquistador 513000", description: "Gana 513000 partidas en total.", icon: "trophy", iconColor: "#27AE60", target: 513000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_58", title: "Conquistador 522000", description: "Gana 522000 partidas en total.", icon: "trophy", iconColor: "#FF6B00", target: 522000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_59", title: "Conquistador 531000", description: "Gana 531000 partidas en total.", icon: "trophy", iconColor: "#D4AF37", target: 531000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_60", title: "Conquistador 540000", description: "Gana 540000 partidas en total.", icon: "trophy", iconColor: "#27AE60", target: 540000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_61", title: "Conquistador 549000", description: "Gana 549000 partidas en total.", icon: "trophy", iconColor: "#C0C0C0", target: 549000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_62", title: "Conquistador 558000", description: "Gana 558000 partidas en total.", icon: "trophy", iconColor: "#FFD700", target: 558000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_63", title: "Conquistador 567000", description: "Gana 567000 partidas en total.", icon: "trophy", iconColor: "#E67E22", target: 567000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_64", title: "Conquistador 640000", description: "Gana 640000 partidas en total.", icon: "trophy", iconColor: "#E74C3C", target: 640000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_65", title: "Conquistador 650000", description: "Gana 650000 partidas en total.", icon: "trophy", iconColor: "#FF6B00", target: 650000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_66", title: "Conquistador 660000", description: "Gana 660000 partidas en total.", icon: "trophy", iconColor: "#A855F7", target: 660000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "extra_win_67", title: "Conquistador 670000", description: "Gana 670000 partidas en total.", icon: "trophy", iconColor: "#27AE60", target: 670000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "extra_win_68", title: "Conquistador 680000", description: "Gana 680000 partidas en total.", icon: "trophy", iconColor: "#E74C3C", target: 680000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "extra_win_69", title: "Conquistador 690000", description: "Gana 690000 partidas en total.", icon: "trophy", iconColor: "#A855F7", target: 690000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "extra_win_70", title: "Conquistador 700000", description: "Gana 700000 partidas en total.", icon: "trophy", iconColor: "#C0C0C0", target: 700000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_1", title: "Racha de 25", description: "Gana 25 partidas seguidas.", icon: "flame", iconColor: "#27AE60", target: 25, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_2", title: "Racha de 50", description: "Gana 50 partidas seguidas.", icon: "flame", iconColor: "#E74C3C", target: 50, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_3", title: "Racha de 75", description: "Gana 75 partidas seguidas.", icon: "flame", iconColor: "#E67E22", target: 75, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_4", title: "Racha de 100", description: "Gana 100 partidas seguidas.", icon: "flame", iconColor: "#D4AF37", target: 100, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_5", title: "Racha de 125", description: "Gana 125 partidas seguidas.", icon: "flame", iconColor: "#D4AF37", target: 125, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_6", title: "Racha de 150", description: "Gana 150 partidas seguidas.", icon: "flame", iconColor: "#FF6B00", target: 150, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_7", title: "Racha de 175", description: "Gana 175 partidas seguidas.", icon: "flame", iconColor: "#FF6B00", target: 175, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_8", title: "Racha de 240", description: "Gana 240 partidas seguidas.", icon: "flame", iconColor: "#9B59B6", target: 240, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_9", title: "Racha de 270", description: "Gana 270 partidas seguidas.", icon: "flame", iconColor: "#E67E22", target: 270, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_10", title: "Racha de 300", description: "Gana 300 partidas seguidas.", icon: "flame", iconColor: "#9B59B6", target: 300, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_11", title: "Racha de 330", description: "Gana 330 partidas seguidas.", icon: "flame", iconColor: "#1A8FC1", target: 330, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_12", title: "Racha de 360", description: "Gana 360 partidas seguidas.", icon: "flame", iconColor: "#C0C0C0", target: 360, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_13", title: "Racha de 390", description: "Gana 390 partidas seguidas.", icon: "flame", iconColor: "#C0C0C0", target: 390, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "streak_ext_14", title: "Racha de 420", description: "Gana 420 partidas seguidas.", icon: "flame", iconColor: "#A855F7", target: 420, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_15", title: "Racha de 525", description: "Gana 525 partidas seguidas.", icon: "flame", iconColor: "#1A8FC1", target: 525, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_16", title: "Racha de 560", description: "Gana 560 partidas seguidas.", icon: "flame", iconColor: "#27AE60", target: 560, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_17", title: "Racha de 595", description: "Gana 595 partidas seguidas.", icon: "flame", iconColor: "#1A8FC1", target: 595, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_18", title: "Racha de 630", description: "Gana 630 partidas seguidas.", icon: "flame", iconColor: "#D4AF37", target: 630, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_19", title: "Racha de 665", description: "Gana 665 partidas seguidas.", icon: "flame", iconColor: "#1A8FC1", target: 665, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "streak_ext_20", title: "Racha de 700", description: "Gana 700 partidas seguidas.", icon: "flame", iconColor: "#27AE60", target: 700, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_21", title: "Racha de 735", description: "Gana 735 partidas seguidas.", icon: "flame", iconColor: "#1A8FC1", target: 735, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_22", title: "Racha de 880", description: "Gana 880 partidas seguidas.", icon: "flame", iconColor: "#E74C3C", target: 880, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_23", title: "Racha de 920", description: "Gana 920 partidas seguidas.", icon: "flame", iconColor: "#27AE60", target: 920, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_24", title: "Racha de 960", description: "Gana 960 partidas seguidas.", icon: "flame", iconColor: "#1A8FC1", target: 960, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_25", title: "Racha de 1000", description: "Gana 1000 partidas seguidas.", icon: "flame", iconColor: "#E74C3C", target: 1000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_26", title: "Racha de 1040", description: "Gana 1040 partidas seguidas.", icon: "flame", iconColor: "#FFD700", target: 1040, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_27", title: "Racha de 1080", description: "Gana 1080 partidas seguidas.", icon: "flame", iconColor: "#E74C3C", target: 1080, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_28", title: "Racha de 1120", description: "Gana 1120 partidas seguidas.", icon: "flame", iconColor: "#E74C3C", target: 1120, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_29", title: "Racha de 1305", description: "Gana 1305 partidas seguidas.", icon: "flame", iconColor: "#FFD700", target: 1305, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "streak_ext_30", title: "Racha de 1350", description: "Gana 1350 partidas seguidas.", icon: "flame", iconColor: "#1A8FC1", target: 1350, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_31", title: "Racha de 1395", description: "Gana 1395 partidas seguidas.", icon: "flame", iconColor: "#1A8FC1", target: 1395, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_32", title: "Racha de 1440", description: "Gana 1440 partidas seguidas.", icon: "flame", iconColor: "#E74C3C", target: 1440, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_33", title: "Racha de 1485", description: "Gana 1485 partidas seguidas.", icon: "flame", iconColor: "#27AE60", target: 1485, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_34", title: "Racha de 1530", description: "Gana 1530 partidas seguidas.", icon: "flame", iconColor: "#FF6B00", target: 1530, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_35", title: "Racha de 1575", description: "Gana 1575 partidas seguidas.", icon: "flame", iconColor: "#C0C0C0", target: 1575, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_36", title: "Racha de 1800", description: "Gana 1800 partidas seguidas.", icon: "flame", iconColor: "#C0C0C0", target: 1800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_37", title: "Racha de 1850", description: "Gana 1850 partidas seguidas.", icon: "flame", iconColor: "#9B59B6", target: 1850, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_38", title: "Racha de 1900", description: "Gana 1900 partidas seguidas.", icon: "flame", iconColor: "#9B59B6", target: 1900, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_39", title: "Racha de 1950", description: "Gana 1950 partidas seguidas.", icon: "flame", iconColor: "#1A8FC1", target: 1950, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_40", title: "Racha de 2000", description: "Gana 2000 partidas seguidas.", icon: "flame", iconColor: "#D4AF37", target: 2000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_41", title: "Racha de 2050", description: "Gana 2050 partidas seguidas.", icon: "flame", iconColor: "#D4AF37", target: 2050, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_42", title: "Racha de 2100", description: "Gana 2100 partidas seguidas.", icon: "flame", iconColor: "#E74C3C", target: 2100, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_43", title: "Racha de 2580", description: "Gana 2580 partidas seguidas.", icon: "flame", iconColor: "#E67E22", target: 2580, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_44", title: "Racha de 2640", description: "Gana 2640 partidas seguidas.", icon: "flame", iconColor: "#E67E22", target: 2640, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "streak_ext_45", title: "Racha de 2700", description: "Gana 2700 partidas seguidas.", icon: "flame", iconColor: "#C0C0C0", target: 2700, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_46", title: "Racha de 2760", description: "Gana 2760 partidas seguidas.", icon: "flame", iconColor: "#E67E22", target: 2760, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_47", title: "Racha de 2820", description: "Gana 2820 partidas seguidas.", icon: "flame", iconColor: "#9B59B6", target: 2820, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_48", title: "Racha de 2880", description: "Gana 2880 partidas seguidas.", icon: "flame", iconColor: "#FF6B00", target: 2880, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_49", title: "Racha de 2940", description: "Gana 2940 partidas seguidas.", icon: "flame", iconColor: "#A855F7", target: 2940, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_50", title: "Racha de 3500", description: "Gana 3500 partidas seguidas.", icon: "flame", iconColor: "#E74C3C", target: 3500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_51", title: "Racha de 3570", description: "Gana 3570 partidas seguidas.", icon: "flame", iconColor: "#E67E22", target: 3570, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_52", title: "Racha de 3640", description: "Gana 3640 partidas seguidas.", icon: "flame", iconColor: "#27AE60", target: 3640, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_53", title: "Racha de 3710", description: "Gana 3710 partidas seguidas.", icon: "flame", iconColor: "#A855F7", target: 3710, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_54", title: "Racha de 3780", description: "Gana 3780 partidas seguidas.", icon: "flame", iconColor: "#E74C3C", target: 3780, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_55", title: "Racha de 3850", description: "Gana 3850 partidas seguidas.", icon: "flame", iconColor: "#9B59B6", target: 3850, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_56", title: "Racha de 3920", description: "Gana 3920 partidas seguidas.", icon: "flame", iconColor: "#27AE60", target: 3920, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_57", title: "Racha de 4560", description: "Gana 4560 partidas seguidas.", icon: "flame", iconColor: "#E67E22", target: 4560, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_58", title: "Racha de 4640", description: "Gana 4640 partidas seguidas.", icon: "flame", iconColor: "#1A8FC1", target: 4640, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_59", title: "Racha de 4720", description: "Gana 4720 partidas seguidas.", icon: "flame", iconColor: "#E67E22", target: 4720, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_60", title: "Racha de 4800", description: "Gana 4800 partidas seguidas.", icon: "flame", iconColor: "#A855F7", target: 4800, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_61", title: "Racha de 4880", description: "Gana 4880 partidas seguidas.", icon: "flame", iconColor: "#A855F7", target: 4880, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "streak_ext_62", title: "Racha de 4960", description: "Gana 4960 partidas seguidas.", icon: "flame", iconColor: "#FFD700", target: 4960, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_63", title: "Racha de 5040", description: "Gana 5040 partidas seguidas.", icon: "flame", iconColor: "#D4AF37", target: 5040, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_64", title: "Racha de 6400", description: "Gana 6400 partidas seguidas.", icon: "flame", iconColor: "#D4AF37", target: 6400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_65", title: "Racha de 6500", description: "Gana 6500 partidas seguidas.", icon: "flame", iconColor: "#A855F7", target: 6500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_66", title: "Racha de 6600", description: "Gana 6600 partidas seguidas.", icon: "flame", iconColor: "#1A8FC1", target: 6600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_67", title: "Racha de 6700", description: "Gana 6700 partidas seguidas.", icon: "flame", iconColor: "#9B59B6", target: 6700, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "streak_ext_68", title: "Racha de 6800", description: "Gana 6800 partidas seguidas.", icon: "flame", iconColor: "#FF6B00", target: 6800, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "streak_ext_69", title: "Racha de 6900", description: "Gana 6900 partidas seguidas.", icon: "flame", iconColor: "#9B59B6", target: 6900, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "streak_ext_70", title: "Racha de 7000", description: "Gana 7000 partidas seguidas.", icon: "flame", iconColor: "#E67E22", target: 7000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_1", title: "Maestro Especial 500", description: "Juega 500 cartas especiales.", icon: "flash", iconColor: "#1A8FC1", target: 500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_2", title: "Maestro Especial 1000", description: "Juega 1000 cartas especiales.", icon: "flash", iconColor: "#C0C0C0", target: 1000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_3", title: "Maestro Especial 1500", description: "Juega 1500 cartas especiales.", icon: "flash", iconColor: "#D4AF37", target: 1500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_4", title: "Maestro Especial 2000", description: "Juega 2000 cartas especiales.", icon: "flash", iconColor: "#E74C3C", target: 2000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_5", title: "Maestro Especial 2500", description: "Juega 2500 cartas especiales.", icon: "flash", iconColor: "#9B59B6", target: 2500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_6", title: "Maestro Especial 3000", description: "Juega 3000 cartas especiales.", icon: "flash", iconColor: "#C0C0C0", target: 3000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_7", title: "Maestro Especial 3500", description: "Juega 3500 cartas especiales.", icon: "flash", iconColor: "#27AE60", target: 3500, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "special_card_ext_8", title: "Maestro Especial 8000", description: "Juega 8000 cartas especiales.", icon: "flash", iconColor: "#D4AF37", target: 8000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_9", title: "Maestro Especial 9000", description: "Juega 9000 cartas especiales.", icon: "flash", iconColor: "#FFD700", target: 9000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_10", title: "Maestro Especial 10000", description: "Juega 10000 cartas especiales.", icon: "flash", iconColor: "#A855F7", target: 10000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_11", title: "Maestro Especial 11000", description: "Juega 11000 cartas especiales.", icon: "flash", iconColor: "#E67E22", target: 11000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_12", title: "Maestro Especial 12000", description: "Juega 12000 cartas especiales.", icon: "flash", iconColor: "#9B59B6", target: 12000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_13", title: "Maestro Especial 13000", description: "Juega 13000 cartas especiales.", icon: "flash", iconColor: "#A855F7", target: 13000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_14", title: "Maestro Especial 14000", description: "Juega 14000 cartas especiales.", icon: "flash", iconColor: "#A855F7", target: 14000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_15", title: "Maestro Especial 22500", description: "Juega 22500 cartas especiales.", icon: "flash", iconColor: "#9B59B6", target: 22500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_16", title: "Maestro Especial 24000", description: "Juega 24000 cartas especiales.", icon: "flash", iconColor: "#27AE60", target: 24000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_17", title: "Maestro Especial 25500", description: "Juega 25500 cartas especiales.", icon: "flash", iconColor: "#A855F7", target: 25500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_18", title: "Maestro Especial 27000", description: "Juega 27000 cartas especiales.", icon: "flash", iconColor: "#9B59B6", target: 27000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_19", title: "Maestro Especial 28500", description: "Juega 28500 cartas especiales.", icon: "flash", iconColor: "#C0C0C0", target: 28500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_20", title: "Maestro Especial 30000", description: "Juega 30000 cartas especiales.", icon: "flash", iconColor: "#9B59B6", target: 30000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_21", title: "Maestro Especial 31500", description: "Juega 31500 cartas especiales.", icon: "flash", iconColor: "#1A8FC1", target: 31500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_22", title: "Maestro Especial 44000", description: "Juega 44000 cartas especiales.", icon: "flash", iconColor: "#D4AF37", target: 44000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_23", title: "Maestro Especial 46000", description: "Juega 46000 cartas especiales.", icon: "flash", iconColor: "#D4AF37", target: 46000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_24", title: "Maestro Especial 48000", description: "Juega 48000 cartas especiales.", icon: "flash", iconColor: "#27AE60", target: 48000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_25", title: "Maestro Especial 50000", description: "Juega 50000 cartas especiales.", icon: "flash", iconColor: "#A855F7", target: 50000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_26", title: "Maestro Especial 52000", description: "Juega 52000 cartas especiales.", icon: "flash", iconColor: "#E74C3C", target: 52000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_27", title: "Maestro Especial 54000", description: "Juega 54000 cartas especiales.", icon: "flash", iconColor: "#FFD700", target: 54000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_28", title: "Maestro Especial 56000", description: "Juega 56000 cartas especiales.", icon: "flash", iconColor: "#E74C3C", target: 56000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_29", title: "Maestro Especial 72500", description: "Juega 72500 cartas especiales.", icon: "flash", iconColor: "#E67E22", target: 72500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_30", title: "Maestro Especial 75000", description: "Juega 75000 cartas especiales.", icon: "flash", iconColor: "#27AE60", target: 75000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_31", title: "Maestro Especial 77500", description: "Juega 77500 cartas especiales.", icon: "flash", iconColor: "#A855F7", target: 77500, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "special_card_ext_32", title: "Maestro Especial 80000", description: "Juega 80000 cartas especiales.", icon: "flash", iconColor: "#C0C0C0", target: 80000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_33", title: "Maestro Especial 82500", description: "Juega 82500 cartas especiales.", icon: "flash", iconColor: "#9B59B6", target: 82500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_34", title: "Maestro Especial 85000", description: "Juega 85000 cartas especiales.", icon: "flash", iconColor: "#FFD700", target: 85000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "special_card_ext_35", title: "Maestro Especial 87500", description: "Juega 87500 cartas especiales.", icon: "flash", iconColor: "#D4AF37", target: 87500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_36", title: "Maestro Especial 108000", description: "Juega 108000 cartas especiales.", icon: "flash", iconColor: "#D4AF37", target: 108000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_37", title: "Maestro Especial 111000", description: "Juega 111000 cartas especiales.", icon: "flash", iconColor: "#A855F7", target: 111000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_38", title: "Maestro Especial 114000", description: "Juega 114000 cartas especiales.", icon: "flash", iconColor: "#A855F7", target: 114000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_39", title: "Maestro Especial 117000", description: "Juega 117000 cartas especiales.", icon: "flash", iconColor: "#FF6B00", target: 117000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_40", title: "Maestro Especial 120000", description: "Juega 120000 cartas especiales.", icon: "flash", iconColor: "#E67E22", target: 120000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_41", title: "Maestro Especial 123000", description: "Juega 123000 cartas especiales.", icon: "flash", iconColor: "#D4AF37", target: 123000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "special_card_ext_42", title: "Maestro Especial 126000", description: "Juega 126000 cartas especiales.", icon: "flash", iconColor: "#FF6B00", target: 126000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_43", title: "Maestro Especial 172000", description: "Juega 172000 cartas especiales.", icon: "flash", iconColor: "#A855F7", target: 172000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_44", title: "Maestro Especial 176000", description: "Juega 176000 cartas especiales.", icon: "flash", iconColor: "#FFD700", target: 176000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_45", title: "Maestro Especial 180000", description: "Juega 180000 cartas especiales.", icon: "flash", iconColor: "#27AE60", target: 180000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_46", title: "Maestro Especial 184000", description: "Juega 184000 cartas especiales.", icon: "flash", iconColor: "#E74C3C", target: 184000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_47", title: "Maestro Especial 188000", description: "Juega 188000 cartas especiales.", icon: "flash", iconColor: "#A855F7", target: 188000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_48", title: "Maestro Especial 192000", description: "Juega 192000 cartas especiales.", icon: "flash", iconColor: "#E74C3C", target: 192000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "special_card_ext_49", title: "Maestro Especial 196000", description: "Juega 196000 cartas especiales.", icon: "flash", iconColor: "#27AE60", target: 196000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_50", title: "Maestro Especial 250000", description: "Juega 250000 cartas especiales.", icon: "flash", iconColor: "#FFD700", target: 250000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_51", title: "Maestro Especial 255000", description: "Juega 255000 cartas especiales.", icon: "flash", iconColor: "#E67E22", target: 255000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_52", title: "Maestro Especial 260000", description: "Juega 260000 cartas especiales.", icon: "flash", iconColor: "#D4AF37", target: 260000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_53", title: "Maestro Especial 265000", description: "Juega 265000 cartas especiales.", icon: "flash", iconColor: "#FF6B00", target: 265000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_54", title: "Maestro Especial 270000", description: "Juega 270000 cartas especiales.", icon: "flash", iconColor: "#FF6B00", target: 270000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_55", title: "Maestro Especial 275000", description: "Juega 275000 cartas especiales.", icon: "flash", iconColor: "#FF6B00", target: 275000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_56", title: "Maestro Especial 280000", description: "Juega 280000 cartas especiales.", icon: "flash", iconColor: "#FFD700", target: 280000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_57", title: "Maestro Especial 427500", description: "Juega 427500 cartas especiales.", icon: "flash", iconColor: "#FF6B00", target: 427500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_58", title: "Maestro Especial 435000", description: "Juega 435000 cartas especiales.", icon: "flash", iconColor: "#FFD700", target: 435000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_59", title: "Maestro Especial 442500", description: "Juega 442500 cartas especiales.", icon: "flash", iconColor: "#E74C3C", target: 442500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_60", title: "Maestro Especial 450000", description: "Juega 450000 cartas especiales.", icon: "flash", iconColor: "#FF6B00", target: 450000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_61", title: "Maestro Especial 457500", description: "Juega 457500 cartas especiales.", icon: "flash", iconColor: "#A855F7", target: 457500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_62", title: "Maestro Especial 465000", description: "Juega 465000 cartas especiales.", icon: "flash", iconColor: "#1A8FC1", target: 465000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_63", title: "Maestro Especial 472500", description: "Juega 472500 cartas especiales.", icon: "flash", iconColor: "#FFD700", target: 472500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "special_card_ext_64", title: "Maestro Especial 640000", description: "Juega 640000 cartas especiales.", icon: "flash", iconColor: "#FF6B00", target: 640000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_65", title: "Maestro Especial 650000", description: "Juega 650000 cartas especiales.", icon: "flash", iconColor: "#C0C0C0", target: 650000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_66", title: "Maestro Especial 660000", description: "Juega 660000 cartas especiales.", icon: "flash", iconColor: "#FFD700", target: 660000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_67", title: "Maestro Especial 670000", description: "Juega 670000 cartas especiales.", icon: "flash", iconColor: "#E67E22", target: 670000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_68", title: "Maestro Especial 680000", description: "Juega 680000 cartas especiales.", icon: "flash", iconColor: "#D4AF37", target: 680000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "special_card_ext_69", title: "Maestro Especial 690000", description: "Juega 690000 cartas especiales.", icon: "flash", iconColor: "#E67E22", target: 690000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "special_card_ext_70", title: "Maestro Especial 700000", description: "Juega 700000 cartas especiales.", icon: "flash", iconColor: "#E67E22", target: 700000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_1", title: "Nivel Titán 150", description: "Alcanza el nivel 150.", icon: "trending-up", iconColor: "#A855F7", target: 150, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_2", title: "Nivel Titán 300", description: "Alcanza el nivel 300.", icon: "trending-up", iconColor: "#C0C0C0", target: 300, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_3", title: "Nivel Titán 450", description: "Alcanza el nivel 450.", icon: "trending-up", iconColor: "#FF6B00", target: 450, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "level_ext_4", title: "Nivel Titán 600", description: "Alcanza el nivel 600.", icon: "trending-up", iconColor: "#27AE60", target: 600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_5", title: "Nivel Titán 750", description: "Alcanza el nivel 750.", icon: "trending-up", iconColor: "#A855F7", target: 750, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_6", title: "Nivel Titán 900", description: "Alcanza el nivel 900.", icon: "trending-up", iconColor: "#FFD700", target: 900, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_7", title: "Nivel Titán 1050", description: "Alcanza el nivel 1050.", icon: "trending-up", iconColor: "#C0C0C0", target: 1050, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_8", title: "Nivel Titán 1600", description: "Alcanza el nivel 1600.", icon: "trending-up", iconColor: "#E67E22", target: 1600, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_9", title: "Nivel Titán 1800", description: "Alcanza el nivel 1800.", icon: "trending-up", iconColor: "#A855F7", target: 1800, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_10", title: "Nivel Titán 2000", description: "Alcanza el nivel 2000.", icon: "trending-up", iconColor: "#27AE60", target: 2000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_11", title: "Nivel Titán 2200", description: "Alcanza el nivel 2200.", icon: "trending-up", iconColor: "#1A8FC1", target: 2200, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_12", title: "Nivel Titán 2400", description: "Alcanza el nivel 2400.", icon: "trending-up", iconColor: "#E67E22", target: 2400, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_13", title: "Nivel Titán 2600", description: "Alcanza el nivel 2600.", icon: "trending-up", iconColor: "#1A8FC1", target: 2600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_14", title: "Nivel Titán 2800", description: "Alcanza el nivel 2800.", icon: "trending-up", iconColor: "#1A8FC1", target: 2800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_15", title: "Nivel Titán 3750", description: "Alcanza el nivel 3750.", icon: "trending-up", iconColor: "#FFD700", target: 3750, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_16", title: "Nivel Titán 4000", description: "Alcanza el nivel 4000.", icon: "trending-up", iconColor: "#E74C3C", target: 4000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_17", title: "Nivel Titán 4250", description: "Alcanza el nivel 4250.", icon: "trending-up", iconColor: "#FFD700", target: 4250, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_18", title: "Nivel Titán 4500", description: "Alcanza el nivel 4500.", icon: "trending-up", iconColor: "#C0C0C0", target: 4500, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "level_ext_19", title: "Nivel Titán 4750", description: "Alcanza el nivel 4750.", icon: "trending-up", iconColor: "#1A8FC1", target: 4750, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_20", title: "Nivel Titán 5000", description: "Alcanza el nivel 5000.", icon: "trending-up", iconColor: "#E74C3C", target: 5000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_21", title: "Nivel Titán 5250", description: "Alcanza el nivel 5250.", icon: "trending-up", iconColor: "#D4AF37", target: 5250, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_22", title: "Nivel Titán 6600", description: "Alcanza el nivel 6600.", icon: "trending-up", iconColor: "#A855F7", target: 6600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_23", title: "Nivel Titán 6900", description: "Alcanza el nivel 6900.", icon: "trending-up", iconColor: "#E74C3C", target: 6900, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_24", title: "Nivel Titán 7200", description: "Alcanza el nivel 7200.", icon: "trending-up", iconColor: "#9B59B6", target: 7200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_25", title: "Nivel Titán 7500", description: "Alcanza el nivel 7500.", icon: "trending-up", iconColor: "#27AE60", target: 7500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_26", title: "Nivel Titán 7800", description: "Alcanza el nivel 7800.", icon: "trending-up", iconColor: "#9B59B6", target: 7800, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_27", title: "Nivel Titán 8100", description: "Alcanza el nivel 8100.", icon: "trending-up", iconColor: "#27AE60", target: 8100, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_28", title: "Nivel Titán 8400", description: "Alcanza el nivel 8400.", icon: "trending-up", iconColor: "#C0C0C0", target: 8400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_29", title: "Nivel Titán 10150", description: "Alcanza el nivel 10150.", icon: "trending-up", iconColor: "#9B59B6", target: 10150, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_30", title: "Nivel Titán 10500", description: "Alcanza el nivel 10500.", icon: "trending-up", iconColor: "#D4AF37", target: 10500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_31", title: "Nivel Titán 10850", description: "Alcanza el nivel 10850.", icon: "trending-up", iconColor: "#27AE60", target: 10850, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_32", title: "Nivel Titán 11200", description: "Alcanza el nivel 11200.", icon: "trending-up", iconColor: "#9B59B6", target: 11200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_33", title: "Nivel Titán 11550", description: "Alcanza el nivel 11550.", icon: "trending-up", iconColor: "#C0C0C0", target: 11550, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_34", title: "Nivel Titán 11900", description: "Alcanza el nivel 11900.", icon: "trending-up", iconColor: "#E74C3C", target: 11900, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_35", title: "Nivel Titán 12250", description: "Alcanza el nivel 12250.", icon: "trending-up", iconColor: "#FF6B00", target: 12250, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_36", title: "Nivel Titán 14400", description: "Alcanza el nivel 14400.", icon: "trending-up", iconColor: "#1A8FC1", target: 14400, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_37", title: "Nivel Titán 14800", description: "Alcanza el nivel 14800.", icon: "trending-up", iconColor: "#27AE60", target: 14800, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_38", title: "Nivel Titán 15200", description: "Alcanza el nivel 15200.", icon: "trending-up", iconColor: "#FFD700", target: 15200, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_39", title: "Nivel Titán 15600", description: "Alcanza el nivel 15600.", icon: "trending-up", iconColor: "#E74C3C", target: 15600, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_40", title: "Nivel Titán 16000", description: "Alcanza el nivel 16000.", icon: "trending-up", iconColor: "#FFD700", target: 16000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_41", title: "Nivel Titán 16400", description: "Alcanza el nivel 16400.", icon: "trending-up", iconColor: "#9B59B6", target: 16400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_42", title: "Nivel Titán 16800", description: "Alcanza el nivel 16800.", icon: "trending-up", iconColor: "#FFD700", target: 16800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_43", title: "Nivel Titán 19350", description: "Alcanza el nivel 19350.", icon: "trending-up", iconColor: "#E74C3C", target: 19350, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_44", title: "Nivel Titán 19800", description: "Alcanza el nivel 19800.", icon: "trending-up", iconColor: "#FFD700", target: 19800, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_45", title: "Nivel Titán 20250", description: "Alcanza el nivel 20250.", icon: "trending-up", iconColor: "#FF6B00", target: 20250, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_46", title: "Nivel Titán 20700", description: "Alcanza el nivel 20700.", icon: "trending-up", iconColor: "#FFD700", target: 20700, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_47", title: "Nivel Titán 21150", description: "Alcanza el nivel 21150.", icon: "trending-up", iconColor: "#E67E22", target: 21150, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_48", title: "Nivel Titán 21600", description: "Alcanza el nivel 21600.", icon: "trending-up", iconColor: "#9B59B6", target: 21600, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_49", title: "Nivel Titán 22050", description: "Alcanza el nivel 22050.", icon: "trending-up", iconColor: "#E74C3C", target: 22050, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_50", title: "Nivel Titán 25000", description: "Alcanza el nivel 25000.", icon: "trending-up", iconColor: "#E67E22", target: 25000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_51", title: "Nivel Titán 25500", description: "Alcanza el nivel 25500.", icon: "trending-up", iconColor: "#1A8FC1", target: 25500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_52", title: "Nivel Titán 26000", description: "Alcanza el nivel 26000.", icon: "trending-up", iconColor: "#A855F7", target: 26000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_53", title: "Nivel Titán 26500", description: "Alcanza el nivel 26500.", icon: "trending-up", iconColor: "#D4AF37", target: 26500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_54", title: "Nivel Titán 27000", description: "Alcanza el nivel 27000.", icon: "trending-up", iconColor: "#27AE60", target: 27000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_55", title: "Nivel Titán 27500", description: "Alcanza el nivel 27500.", icon: "trending-up", iconColor: "#E74C3C", target: 27500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_56", title: "Nivel Titán 28000", description: "Alcanza el nivel 28000.", icon: "trending-up", iconColor: "#FFD700", target: 28000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "level_ext_57", title: "Nivel Titán 34200", description: "Alcanza el nivel 34200.", icon: "trending-up", iconColor: "#27AE60", target: 34200, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_58", title: "Nivel Titán 34800", description: "Alcanza el nivel 34800.", icon: "trending-up", iconColor: "#A855F7", target: 34800, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "level_ext_59", title: "Nivel Titán 35400", description: "Alcanza el nivel 35400.", icon: "trending-up", iconColor: "#A855F7", target: 35400, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_60", title: "Nivel Titán 36000", description: "Alcanza el nivel 36000.", icon: "trending-up", iconColor: "#E74C3C", target: 36000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_61", title: "Nivel Titán 36600", description: "Alcanza el nivel 36600.", icon: "trending-up", iconColor: "#E74C3C", target: 36600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_62", title: "Nivel Titán 37200", description: "Alcanza el nivel 37200.", icon: "trending-up", iconColor: "#D4AF37", target: 37200, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_63", title: "Nivel Titán 37800", description: "Alcanza el nivel 37800.", icon: "trending-up", iconColor: "#D4AF37", target: 37800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_64", title: "Nivel Titán 51200", description: "Alcanza el nivel 51200.", icon: "trending-up", iconColor: "#27AE60", target: 51200, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_65", title: "Nivel Titán 52000", description: "Alcanza el nivel 52000.", icon: "trending-up", iconColor: "#9B59B6", target: 52000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "level_ext_66", title: "Nivel Titán 52800", description: "Alcanza el nivel 52800.", icon: "trending-up", iconColor: "#E74C3C", target: 52800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_67", title: "Nivel Titán 53600", description: "Alcanza el nivel 53600.", icon: "trending-up", iconColor: "#E67E22", target: 53600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_68", title: "Nivel Titán 54400", description: "Alcanza el nivel 54400.", icon: "trending-up", iconColor: "#E67E22", target: 54400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "level_ext_69", title: "Nivel Titán 55200", description: "Alcanza el nivel 55200.", icon: "trending-up", iconColor: "#9B59B6", target: 55200, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "level_ext_70", title: "Nivel Titán 56000", description: "Alcanza el nivel 56000.", icon: "trending-up", iconColor: "#27AE60", target: 56000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_1", title: "Leyenda Social 200", description: "Juega 200 partidas multijugador.", icon: "people", iconColor: "#FF6B00", target: 200, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_2", title: "Leyenda Social 400", description: "Juega 400 partidas multijugador.", icon: "people", iconColor: "#FF6B00", target: 400, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_3", title: "Leyenda Social 600", description: "Juega 600 partidas multijugador.", icon: "people", iconColor: "#1A8FC1", target: 600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_4", title: "Leyenda Social 800", description: "Juega 800 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 800, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_5", title: "Leyenda Social 1000", description: "Juega 1000 partidas multijugador.", icon: "people", iconColor: "#1A8FC1", target: 1000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_6", title: "Leyenda Social 1200", description: "Juega 1200 partidas multijugador.", icon: "people", iconColor: "#E74C3C", target: 1200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_7", title: "Leyenda Social 1400", description: "Juega 1400 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 1400, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_8", title: "Leyenda Social 2400", description: "Juega 2400 partidas multijugador.", icon: "people", iconColor: "#A855F7", target: 2400, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_9", title: "Leyenda Social 2700", description: "Juega 2700 partidas multijugador.", icon: "people", iconColor: "#E74C3C", target: 2700, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_10", title: "Leyenda Social 3000", description: "Juega 3000 partidas multijugador.", icon: "people", iconColor: "#1A8FC1", target: 3000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_11", title: "Leyenda Social 3300", description: "Juega 3300 partidas multijugador.", icon: "people", iconColor: "#1A8FC1", target: 3300, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_12", title: "Leyenda Social 3600", description: "Juega 3600 partidas multijugador.", icon: "people", iconColor: "#D4AF37", target: 3600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_13", title: "Leyenda Social 3900", description: "Juega 3900 partidas multijugador.", icon: "people", iconColor: "#E67E22", target: 3900, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_14", title: "Leyenda Social 4200", description: "Juega 4200 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 4200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_15", title: "Leyenda Social 6000", description: "Juega 6000 partidas multijugador.", icon: "people", iconColor: "#1A8FC1", target: 6000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_16", title: "Leyenda Social 6400", description: "Juega 6400 partidas multijugador.", icon: "people", iconColor: "#E67E22", target: 6400, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_17", title: "Leyenda Social 6800", description: "Juega 6800 partidas multijugador.", icon: "people", iconColor: "#D4AF37", target: 6800, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_18", title: "Leyenda Social 7200", description: "Juega 7200 partidas multijugador.", icon: "people", iconColor: "#FF6B00", target: 7200, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "multi_ext_19", title: "Leyenda Social 7600", description: "Juega 7600 partidas multijugador.", icon: "people", iconColor: "#27AE60", target: 7600, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_20", title: "Leyenda Social 8000", description: "Juega 8000 partidas multijugador.", icon: "people", iconColor: "#E74C3C", target: 8000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_21", title: "Leyenda Social 8400", description: "Juega 8400 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 8400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_22", title: "Leyenda Social 11000", description: "Juega 11000 partidas multijugador.", icon: "people", iconColor: "#E74C3C", target: 11000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "multi_ext_23", title: "Leyenda Social 11500", description: "Juega 11500 partidas multijugador.", icon: "people", iconColor: "#D4AF37", target: 11500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_24", title: "Leyenda Social 12000", description: "Juega 12000 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 12000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_25", title: "Leyenda Social 12500", description: "Juega 12500 partidas multijugador.", icon: "people", iconColor: "#E67E22", target: 12500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_26", title: "Leyenda Social 13000", description: "Juega 13000 partidas multijugador.", icon: "people", iconColor: "#1A8FC1", target: 13000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_27", title: "Leyenda Social 13500", description: "Juega 13500 partidas multijugador.", icon: "people", iconColor: "#9B59B6", target: 13500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_28", title: "Leyenda Social 14000", description: "Juega 14000 partidas multijugador.", icon: "people", iconColor: "#E67E22", target: 14000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_29", title: "Leyenda Social 17400", description: "Juega 17400 partidas multijugador.", icon: "people", iconColor: "#E67E22", target: 17400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_30", title: "Leyenda Social 18000", description: "Juega 18000 partidas multijugador.", icon: "people", iconColor: "#E74C3C", target: 18000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_31", title: "Leyenda Social 18600", description: "Juega 18600 partidas multijugador.", icon: "people", iconColor: "#1A8FC1", target: 18600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_32", title: "Leyenda Social 19200", description: "Juega 19200 partidas multijugador.", icon: "people", iconColor: "#FFD700", target: 19200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_33", title: "Leyenda Social 19800", description: "Juega 19800 partidas multijugador.", icon: "people", iconColor: "#FF6B00", target: 19800, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_34", title: "Leyenda Social 20400", description: "Juega 20400 partidas multijugador.", icon: "people", iconColor: "#E74C3C", target: 20400, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_35", title: "Leyenda Social 21000", description: "Juega 21000 partidas multijugador.", icon: "people", iconColor: "#FFD700", target: 21000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_36", title: "Leyenda Social 25200", description: "Juega 25200 partidas multijugador.", icon: "people", iconColor: "#E74C3C", target: 25200, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_37", title: "Leyenda Social 25900", description: "Juega 25900 partidas multijugador.", icon: "people", iconColor: "#1A8FC1", target: 25900, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_38", title: "Leyenda Social 26600", description: "Juega 26600 partidas multijugador.", icon: "people", iconColor: "#D4AF37", target: 26600, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_39", title: "Leyenda Social 27300", description: "Juega 27300 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 27300, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_40", title: "Leyenda Social 28000", description: "Juega 28000 partidas multijugador.", icon: "people", iconColor: "#E74C3C", target: 28000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "multi_ext_41", title: "Leyenda Social 28700", description: "Juega 28700 partidas multijugador.", icon: "people", iconColor: "#27AE60", target: 28700, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_42", title: "Leyenda Social 29400", description: "Juega 29400 partidas multijugador.", icon: "people", iconColor: "#27AE60", target: 29400, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_43", title: "Leyenda Social 34400", description: "Juega 34400 partidas multijugador.", icon: "people", iconColor: "#9B59B6", target: 34400, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_44", title: "Leyenda Social 35200", description: "Juega 35200 partidas multijugador.", icon: "people", iconColor: "#9B59B6", target: 35200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_45", title: "Leyenda Social 36000", description: "Juega 36000 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 36000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_46", title: "Leyenda Social 36800", description: "Juega 36800 partidas multijugador.", icon: "people", iconColor: "#FF6B00", target: 36800, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_47", title: "Leyenda Social 37600", description: "Juega 37600 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 37600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_48", title: "Leyenda Social 38400", description: "Juega 38400 partidas multijugador.", icon: "people", iconColor: "#27AE60", target: 38400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_49", title: "Leyenda Social 39200", description: "Juega 39200 partidas multijugador.", icon: "people", iconColor: "#E74C3C", target: 39200, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_50", title: "Leyenda Social 45000", description: "Juega 45000 partidas multijugador.", icon: "people", iconColor: "#E67E22", target: 45000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_51", title: "Leyenda Social 45900", description: "Juega 45900 partidas multijugador.", icon: "people", iconColor: "#FF6B00", target: 45900, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_52", title: "Leyenda Social 46800", description: "Juega 46800 partidas multijugador.", icon: "people", iconColor: "#FF6B00", target: 46800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_53", title: "Leyenda Social 47700", description: "Juega 47700 partidas multijugador.", icon: "people", iconColor: "#D4AF37", target: 47700, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_54", title: "Leyenda Social 48600", description: "Juega 48600 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 48600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_55", title: "Leyenda Social 49500", description: "Juega 49500 partidas multijugador.", icon: "people", iconColor: "#27AE60", target: 49500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_56", title: "Leyenda Social 50400", description: "Juega 50400 partidas multijugador.", icon: "people", iconColor: "#E67E22", target: 50400, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_57", title: "Leyenda Social 57000", description: "Juega 57000 partidas multijugador.", icon: "people", iconColor: "#E74C3C", target: 57000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_58", title: "Leyenda Social 58000", description: "Juega 58000 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 58000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_59", title: "Leyenda Social 59000", description: "Juega 59000 partidas multijugador.", icon: "people", iconColor: "#A855F7", target: 59000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_60", title: "Leyenda Social 60000", description: "Juega 60000 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 60000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_61", title: "Leyenda Social 61000", description: "Juega 61000 partidas multijugador.", icon: "people", iconColor: "#C0C0C0", target: 61000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_62", title: "Leyenda Social 62000", description: "Juega 62000 partidas multijugador.", icon: "people", iconColor: "#27AE60", target: 62000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_63", title: "Leyenda Social 63000", description: "Juega 63000 partidas multijugador.", icon: "people", iconColor: "#E67E22", target: 63000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_64", title: "Leyenda Social 128000", description: "Juega 128000 partidas multijugador.", icon: "people", iconColor: "#E74C3C", target: 128000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_65", title: "Leyenda Social 130000", description: "Juega 130000 partidas multijugador.", icon: "people", iconColor: "#FFD700", target: 130000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "multi_ext_66", title: "Leyenda Social 132000", description: "Juega 132000 partidas multijugador.", icon: "people", iconColor: "#1A8FC1", target: 132000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_67", title: "Leyenda Social 134000", description: "Juega 134000 partidas multijugador.", icon: "people", iconColor: "#D4AF37", target: 134000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "multi_ext_68", title: "Leyenda Social 136000", description: "Juega 136000 partidas multijugador.", icon: "people", iconColor: "#1A8FC1", target: 136000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_69", title: "Leyenda Social 138000", description: "Juega 138000 partidas multijugador.", icon: "people", iconColor: "#FF6B00", target: 138000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "multi_ext_70", title: "Leyenda Social 140000", description: "Juega 140000 partidas multijugador.", icon: "people", iconColor: "#27AE60", target: 140000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_1", title: "Coleccionista de Oro 100", description: "Posee 100 artículos de la tienda.", icon: "gift", iconColor: "#1A8FC1", target: 100, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "collect_ext_2", title: "Coleccionista de Oro 200", description: "Posee 200 artículos de la tienda.", icon: "gift", iconColor: "#9B59B6", target: 200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_3", title: "Coleccionista de Oro 300", description: "Posee 300 artículos de la tienda.", icon: "gift", iconColor: "#FFD700", target: 300, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_4", title: "Coleccionista de Oro 400", description: "Posee 400 artículos de la tienda.", icon: "gift", iconColor: "#D4AF37", target: 400, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_5", title: "Coleccionista de Oro 500", description: "Posee 500 artículos de la tienda.", icon: "gift", iconColor: "#C0C0C0", target: 500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_6", title: "Coleccionista de Oro 600", description: "Posee 600 artículos de la tienda.", icon: "gift", iconColor: "#C0C0C0", target: 600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_7", title: "Coleccionista de Oro 700", description: "Posee 700 artículos de la tienda.", icon: "gift", iconColor: "#E67E22", target: 700, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_8", title: "Coleccionista de Oro 1200", description: "Posee 1200 artículos de la tienda.", icon: "gift", iconColor: "#27AE60", target: 1200, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_9", title: "Coleccionista de Oro 1350", description: "Posee 1350 artículos de la tienda.", icon: "gift", iconColor: "#FF6B00", target: 1350, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_10", title: "Coleccionista de Oro 1500", description: "Posee 1500 artículos de la tienda.", icon: "gift", iconColor: "#FFD700", target: 1500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_11", title: "Coleccionista de Oro 1650", description: "Posee 1650 artículos de la tienda.", icon: "gift", iconColor: "#E67E22", target: 1650, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "collect_ext_12", title: "Coleccionista de Oro 1800", description: "Posee 1800 artículos de la tienda.", icon: "gift", iconColor: "#A855F7", target: 1800, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_13", title: "Coleccionista de Oro 1950", description: "Posee 1950 artículos de la tienda.", icon: "gift", iconColor: "#9B59B6", target: 1950, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_14", title: "Coleccionista de Oro 2100", description: "Posee 2100 artículos de la tienda.", icon: "gift", iconColor: "#C0C0C0", target: 2100, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_15", title: "Coleccionista de Oro 3000", description: "Posee 3000 artículos de la tienda.", icon: "gift", iconColor: "#1A8FC1", target: 3000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_16", title: "Coleccionista de Oro 3200", description: "Posee 3200 artículos de la tienda.", icon: "gift", iconColor: "#27AE60", target: 3200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_17", title: "Coleccionista de Oro 3400", description: "Posee 3400 artículos de la tienda.", icon: "gift", iconColor: "#E74C3C", target: 3400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_18", title: "Coleccionista de Oro 3600", description: "Posee 3600 artículos de la tienda.", icon: "gift", iconColor: "#E74C3C", target: 3600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_19", title: "Coleccionista de Oro 3800", description: "Posee 3800 artículos de la tienda.", icon: "gift", iconColor: "#E74C3C", target: 3800, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_20", title: "Coleccionista de Oro 4000", description: "Posee 4000 artículos de la tienda.", icon: "gift", iconColor: "#1A8FC1", target: 4000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_21", title: "Coleccionista de Oro 4200", description: "Posee 4200 artículos de la tienda.", icon: "gift", iconColor: "#9B59B6", target: 4200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_22", title: "Coleccionista de Oro 5500", description: "Posee 5500 artículos de la tienda.", icon: "gift", iconColor: "#FF6B00", target: 5500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_23", title: "Coleccionista de Oro 5750", description: "Posee 5750 artículos de la tienda.", icon: "gift", iconColor: "#D4AF37", target: 5750, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_24", title: "Coleccionista de Oro 6000", description: "Posee 6000 artículos de la tienda.", icon: "gift", iconColor: "#E67E22", target: 6000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_25", title: "Coleccionista de Oro 6250", description: "Posee 6250 artículos de la tienda.", icon: "gift", iconColor: "#A855F7", target: 6250, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_26", title: "Coleccionista de Oro 6500", description: "Posee 6500 artículos de la tienda.", icon: "gift", iconColor: "#A855F7", target: 6500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_27", title: "Coleccionista de Oro 6750", description: "Posee 6750 artículos de la tienda.", icon: "gift", iconColor: "#FF6B00", target: 6750, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_28", title: "Coleccionista de Oro 7000", description: "Posee 7000 artículos de la tienda.", icon: "gift", iconColor: "#1A8FC1", target: 7000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_29", title: "Coleccionista de Oro 8700", description: "Posee 8700 artículos de la tienda.", icon: "gift", iconColor: "#1A8FC1", target: 8700, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_30", title: "Coleccionista de Oro 9000", description: "Posee 9000 artículos de la tienda.", icon: "gift", iconColor: "#FF6B00", target: 9000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_31", title: "Coleccionista de Oro 9300", description: "Posee 9300 artículos de la tienda.", icon: "gift", iconColor: "#C0C0C0", target: 9300, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_32", title: "Coleccionista de Oro 9600", description: "Posee 9600 artículos de la tienda.", icon: "gift", iconColor: "#FFD700", target: 9600, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_33", title: "Coleccionista de Oro 9900", description: "Posee 9900 artículos de la tienda.", icon: "gift", iconColor: "#FF6B00", target: 9900, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "collect_ext_34", title: "Coleccionista de Oro 10200", description: "Posee 10200 artículos de la tienda.", icon: "gift", iconColor: "#D4AF37", target: 10200, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_35", title: "Coleccionista de Oro 10500", description: "Posee 10500 artículos de la tienda.", icon: "gift", iconColor: "#C0C0C0", target: 10500, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "collect_ext_36", title: "Coleccionista de Oro 14400", description: "Posee 14400 artículos de la tienda.", icon: "gift", iconColor: "#FFD700", target: 14400, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_37", title: "Coleccionista de Oro 14800", description: "Posee 14800 artículos de la tienda.", icon: "gift", iconColor: "#FFD700", target: 14800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_38", title: "Coleccionista de Oro 15200", description: "Posee 15200 artículos de la tienda.", icon: "gift", iconColor: "#9B59B6", target: 15200, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_39", title: "Coleccionista de Oro 15600", description: "Posee 15600 artículos de la tienda.", icon: "gift", iconColor: "#A855F7", target: 15600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_40", title: "Coleccionista de Oro 16000", description: "Posee 16000 artículos de la tienda.", icon: "gift", iconColor: "#FF6B00", target: 16000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_41", title: "Coleccionista de Oro 16400", description: "Posee 16400 artículos de la tienda.", icon: "gift", iconColor: "#C0C0C0", target: 16400, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_42", title: "Coleccionista de Oro 16800", description: "Posee 16800 artículos de la tienda.", icon: "gift", iconColor: "#D4AF37", target: 16800, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_43", title: "Coleccionista de Oro 21500", description: "Posee 21500 artículos de la tienda.", icon: "gift", iconColor: "#E74C3C", target: 21500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_44", title: "Coleccionista de Oro 22000", description: "Posee 22000 artículos de la tienda.", icon: "gift", iconColor: "#FF6B00", target: 22000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "collect_ext_45", title: "Coleccionista de Oro 22500", description: "Posee 22500 artículos de la tienda.", icon: "gift", iconColor: "#D4AF37", target: 22500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_46", title: "Coleccionista de Oro 23000", description: "Posee 23000 artículos de la tienda.", icon: "gift", iconColor: "#9B59B6", target: 23000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_47", title: "Coleccionista de Oro 23500", description: "Posee 23500 artículos de la tienda.", icon: "gift", iconColor: "#D4AF37", target: 23500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_48", title: "Coleccionista de Oro 24000", description: "Posee 24000 artículos de la tienda.", icon: "gift", iconColor: "#C0C0C0", target: 24000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_49", title: "Coleccionista de Oro 24500", description: "Posee 24500 artículos de la tienda.", icon: "gift", iconColor: "#E74C3C", target: 24500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_50", title: "Coleccionista de Oro 30000", description: "Posee 30000 artículos de la tienda.", icon: "gift", iconColor: "#1A8FC1", target: 30000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_51", title: "Coleccionista de Oro 30600", description: "Posee 30600 artículos de la tienda.", icon: "gift", iconColor: "#D4AF37", target: 30600, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_52", title: "Coleccionista de Oro 31200", description: "Posee 31200 artículos de la tienda.", icon: "gift", iconColor: "#1A8FC1", target: 31200, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_53", title: "Coleccionista de Oro 31800", description: "Posee 31800 artículos de la tienda.", icon: "gift", iconColor: "#D4AF37", target: 31800, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_54", title: "Coleccionista de Oro 32400", description: "Posee 32400 artículos de la tienda.", icon: "gift", iconColor: "#1A8FC1", target: 32400, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_55", title: "Coleccionista de Oro 33000", description: "Posee 33000 artículos de la tienda.", icon: "gift", iconColor: "#D4AF37", target: 33000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_56", title: "Coleccionista de Oro 33600", description: "Posee 33600 artículos de la tienda.", icon: "gift", iconColor: "#FFD700", target: 33600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_57", title: "Coleccionista de Oro 39900", description: "Posee 39900 artículos de la tienda.", icon: "gift", iconColor: "#27AE60", target: 39900, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_58", title: "Coleccionista de Oro 40600", description: "Posee 40600 artículos de la tienda.", icon: "gift", iconColor: "#27AE60", target: 40600, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_59", title: "Coleccionista de Oro 41300", description: "Posee 41300 artículos de la tienda.", icon: "gift", iconColor: "#E74C3C", target: 41300, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_60", title: "Coleccionista de Oro 42000", description: "Posee 42000 artículos de la tienda.", icon: "gift", iconColor: "#E67E22", target: 42000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "collect_ext_61", title: "Coleccionista de Oro 42700", description: "Posee 42700 artículos de la tienda.", icon: "gift", iconColor: "#FFD700", target: 42700, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_62", title: "Coleccionista de Oro 43400", description: "Posee 43400 artículos de la tienda.", icon: "gift", iconColor: "#9B59B6", target: 43400, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_63", title: "Coleccionista de Oro 44100", description: "Posee 44100 artículos de la tienda.", icon: "gift", iconColor: "#C0C0C0", target: 44100, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_64", title: "Coleccionista de Oro 51200", description: "Posee 51200 artículos de la tienda.", icon: "gift", iconColor: "#D4AF37", target: 51200, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_65", title: "Coleccionista de Oro 52000", description: "Posee 52000 artículos de la tienda.", icon: "gift", iconColor: "#27AE60", target: 52000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "collect_ext_66", title: "Coleccionista de Oro 52800", description: "Posee 52800 artículos de la tienda.", icon: "gift", iconColor: "#A855F7", target: 52800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_67", title: "Coleccionista de Oro 53600", description: "Posee 53600 artículos de la tienda.", icon: "gift", iconColor: "#C0C0C0", target: 53600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_68", title: "Coleccionista de Oro 54400", description: "Posee 54400 artículos de la tienda.", icon: "gift", iconColor: "#C0C0C0", target: 54400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "collect_ext_69", title: "Coleccionista de Oro 55200", description: "Posee 55200 artículos de la tienda.", icon: "gift", iconColor: "#FFD700", target: 55200, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "collect_ext_70", title: "Coleccionista de Oro 56000", description: "Posee 56000 artículos de la tienda.", icon: "gift", iconColor: "#9B59B6", target: 56000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_1", title: "Veterano de 100h", description: "Juega un total de 100 horas.", icon: "time", iconColor: "#E67E22", target: 100, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_2", title: "Veterano de 200h", description: "Juega un total de 200 horas.", icon: "time", iconColor: "#E74C3C", target: 200, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "time_ext_3", title: "Veterano de 300h", description: "Juega un total de 300 horas.", icon: "time", iconColor: "#27AE60", target: 300, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_4", title: "Veterano de 400h", description: "Juega un total de 400 horas.", icon: "time", iconColor: "#27AE60", target: 400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_5", title: "Veterano de 500h", description: "Juega un total de 500 horas.", icon: "time", iconColor: "#E74C3C", target: 500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_6", title: "Veterano de 600h", description: "Juega un total de 600 horas.", icon: "time", iconColor: "#C0C0C0", target: 600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_7", title: "Veterano de 700h", description: "Juega un total de 700 horas.", icon: "time", iconColor: "#D4AF37", target: 700, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_8", title: "Veterano de 2000h", description: "Juega un total de 2000 horas.", icon: "time", iconColor: "#D4AF37", target: 2000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_9", title: "Veterano de 2250h", description: "Juega un total de 2250 horas.", icon: "time", iconColor: "#1A8FC1", target: 2250, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_10", title: "Veterano de 2500h", description: "Juega un total de 2500 horas.", icon: "time", iconColor: "#FF6B00", target: 2500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_11", title: "Veterano de 2750h", description: "Juega un total de 2750 horas.", icon: "time", iconColor: "#FF6B00", target: 2750, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_12", title: "Veterano de 3000h", description: "Juega un total de 3000 horas.", icon: "time", iconColor: "#FFD700", target: 3000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_13", title: "Veterano de 3250h", description: "Juega un total de 3250 horas.", icon: "time", iconColor: "#27AE60", target: 3250, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_14", title: "Veterano de 3500h", description: "Juega un total de 3500 horas.", icon: "time", iconColor: "#E67E22", target: 3500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_15", title: "Veterano de 7500h", description: "Juega un total de 7500 horas.", icon: "time", iconColor: "#E74C3C", target: 7500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_16", title: "Veterano de 8000h", description: "Juega un total de 8000 horas.", icon: "time", iconColor: "#FFD700", target: 8000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_17", title: "Veterano de 8500h", description: "Juega un total de 8500 horas.", icon: "time", iconColor: "#D4AF37", target: 8500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_18", title: "Veterano de 9000h", description: "Juega un total de 9000 horas.", icon: "time", iconColor: "#1A8FC1", target: 9000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_19", title: "Veterano de 9500h", description: "Juega un total de 9500 horas.", icon: "time", iconColor: "#1A8FC1", target: 9500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_20", title: "Veterano de 10000h", description: "Juega un total de 10000 horas.", icon: "time", iconColor: "#A855F7", target: 10000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_21", title: "Veterano de 10500h", description: "Juega un total de 10500 horas.", icon: "time", iconColor: "#9B59B6", target: 10500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "time_ext_22", title: "Veterano de 22000h", description: "Juega un total de 22000 horas.", icon: "time", iconColor: "#FF6B00", target: 22000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_23", title: "Veterano de 23000h", description: "Juega un total de 23000 horas.", icon: "time", iconColor: "#C0C0C0", target: 23000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_24", title: "Veterano de 24000h", description: "Juega un total de 24000 horas.", icon: "time", iconColor: "#A855F7", target: 24000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "time_ext_25", title: "Veterano de 25000h", description: "Juega un total de 25000 horas.", icon: "time", iconColor: "#9B59B6", target: 25000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_26", title: "Veterano de 26000h", description: "Juega un total de 26000 horas.", icon: "time", iconColor: "#A855F7", target: 26000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "time_ext_27", title: "Veterano de 27000h", description: "Juega un total de 27000 horas.", icon: "time", iconColor: "#27AE60", target: 27000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_28", title: "Veterano de 28000h", description: "Juega un total de 28000 horas.", icon: "time", iconColor: "#27AE60", target: 28000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "time_ext_29", title: "Veterano de 43500h", description: "Juega un total de 43500 horas.", icon: "time", iconColor: "#C0C0C0", target: 43500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_30", title: "Veterano de 45000h", description: "Juega un total de 45000 horas.", icon: "time", iconColor: "#FF6B00", target: 45000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_31", title: "Veterano de 46500h", description: "Juega un total de 46500 horas.", icon: "time", iconColor: "#FFD700", target: 46500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "time_ext_32", title: "Veterano de 48000h", description: "Juega un total de 48000 horas.", icon: "time", iconColor: "#A855F7", target: 48000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_33", title: "Veterano de 49500h", description: "Juega un total de 49500 horas.", icon: "time", iconColor: "#FFD700", target: 49500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_34", title: "Veterano de 51000h", description: "Juega un total de 51000 horas.", icon: "time", iconColor: "#A855F7", target: 51000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_35", title: "Veterano de 52500h", description: "Juega un total de 52500 horas.", icon: "time", iconColor: "#1A8FC1", target: 52500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_36", title: "Veterano de 72000h", description: "Juega un total de 72000 horas.", icon: "time", iconColor: "#27AE60", target: 72000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "time_ext_37", title: "Veterano de 74000h", description: "Juega un total de 74000 horas.", icon: "time", iconColor: "#27AE60", target: 74000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_38", title: "Veterano de 76000h", description: "Juega un total de 76000 horas.", icon: "time", iconColor: "#FF6B00", target: 76000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_39", title: "Veterano de 78000h", description: "Juega un total de 78000 horas.", icon: "time", iconColor: "#E67E22", target: 78000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_40", title: "Veterano de 80000h", description: "Juega un total de 80000 horas.", icon: "time", iconColor: "#E67E22", target: 80000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_41", title: "Veterano de 82000h", description: "Juega un total de 82000 horas.", icon: "time", iconColor: "#1A8FC1", target: 82000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_42", title: "Veterano de 84000h", description: "Juega un total de 84000 horas.", icon: "time", iconColor: "#9B59B6", target: 84000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_43", title: "Veterano de 129000h", description: "Juega un total de 129000 horas.", icon: "time", iconColor: "#A855F7", target: 129000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_44", title: "Veterano de 132000h", description: "Juega un total de 132000 horas.", icon: "time", iconColor: "#C0C0C0", target: 132000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_45", title: "Veterano de 135000h", description: "Juega un total de 135000 horas.", icon: "time", iconColor: "#D4AF37", target: 135000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_46", title: "Veterano de 138000h", description: "Juega un total de 138000 horas.", icon: "time", iconColor: "#1A8FC1", target: 138000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_47", title: "Veterano de 141000h", description: "Juega un total de 141000 horas.", icon: "time", iconColor: "#E74C3C", target: 141000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "time_ext_48", title: "Veterano de 144000h", description: "Juega un total de 144000 horas.", icon: "time", iconColor: "#C0C0C0", target: 144000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_49", title: "Veterano de 147000h", description: "Juega un total de 147000 horas.", icon: "time", iconColor: "#D4AF37", target: 147000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "time_ext_50", title: "Veterano de 200000h", description: "Juega un total de 200000 horas.", icon: "time", iconColor: "#A855F7", target: 200000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_51", title: "Veterano de 204000h", description: "Juega un total de 204000 horas.", icon: "time", iconColor: "#C0C0C0", target: 204000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_52", title: "Veterano de 208000h", description: "Juega un total de 208000 horas.", icon: "time", iconColor: "#E74C3C", target: 208000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_53", title: "Veterano de 212000h", description: "Juega un total de 212000 horas.", icon: "time", iconColor: "#9B59B6", target: 212000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_54", title: "Veterano de 216000h", description: "Juega un total de 216000 horas.", icon: "time", iconColor: "#A855F7", target: 216000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_55", title: "Veterano de 220000h", description: "Juega un total de 220000 horas.", icon: "time", iconColor: "#E67E22", target: 220000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_56", title: "Veterano de 224000h", description: "Juega un total de 224000 horas.", icon: "time", iconColor: "#27AE60", target: 224000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_57", title: "Veterano de 285000h", description: "Juega un total de 285000 horas.", icon: "time", iconColor: "#A855F7", target: 285000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "time_ext_58", title: "Veterano de 290000h", description: "Juega un total de 290000 horas.", icon: "time", iconColor: "#FFD700", target: 290000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_59", title: "Veterano de 295000h", description: "Juega un total de 295000 horas.", icon: "time", iconColor: "#FFD700", target: 295000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_60", title: "Veterano de 300000h", description: "Juega un total de 300000 horas.", icon: "time", iconColor: "#27AE60", target: 300000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_61", title: "Veterano de 305000h", description: "Juega un total de 305000 horas.", icon: "time", iconColor: "#D4AF37", target: 305000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "time_ext_62", title: "Veterano de 310000h", description: "Juega un total de 310000 horas.", icon: "time", iconColor: "#E74C3C", target: 310000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "time_ext_63", title: "Veterano de 315000h", description: "Juega un total de 315000 horas.", icon: "time", iconColor: "#E74C3C", target: 315000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "time_ext_64", title: "Veterano de 640000h", description: "Juega un total de 640000 horas.", icon: "time", iconColor: "#FFD700", target: 640000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_65", title: "Veterano de 650000h", description: "Juega un total de 650000 horas.", icon: "time", iconColor: "#FFD700", target: 650000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "time_ext_66", title: "Veterano de 660000h", description: "Juega un total de 660000 horas.", icon: "time", iconColor: "#27AE60", target: 660000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_67", title: "Veterano de 670000h", description: "Juega un total de 670000 horas.", icon: "time", iconColor: "#D4AF37", target: 670000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "time_ext_68", title: "Veterano de 680000h", description: "Juega un total de 680000 horas.", icon: "time", iconColor: "#27AE60", target: 680000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_69", title: "Veterano de 690000h", description: "Juega un total de 690000 horas.", icon: "time", iconColor: "#D4AF37", target: 690000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "time_ext_70", title: "Veterano de 700000h", description: "Juega un total de 700000 horas.", icon: "time", iconColor: "#D4AF37", target: 700000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_1", title: "Melómano de Cartas 100", description: "Escucha 100 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 100, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_2", title: "Melómano de Cartas 200", description: "Escucha 200 efectos de sonido.", icon: "musical-notes", iconColor: "#E67E22", target: 200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_3", title: "Melómano de Cartas 300", description: "Escucha 300 efectos de sonido.", icon: "musical-notes", iconColor: "#E67E22", target: 300, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_4", title: "Melómano de Cartas 400", description: "Escucha 400 efectos de sonido.", icon: "musical-notes", iconColor: "#E67E22", target: 400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_5", title: "Melómano de Cartas 500", description: "Escucha 500 efectos de sonido.", icon: "musical-notes", iconColor: "#FFD700", target: 500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_6", title: "Melómano de Cartas 600", description: "Escucha 600 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 600, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "audio_ext_7", title: "Melómano de Cartas 700", description: "Escucha 700 efectos de sonido.", icon: "musical-notes", iconColor: "#FF6B00", target: 700, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_8", title: "Melómano de Cartas 1600", description: "Escucha 1600 efectos de sonido.", icon: "musical-notes", iconColor: "#9B59B6", target: 1600, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_9", title: "Melómano de Cartas 1800", description: "Escucha 1800 efectos de sonido.", icon: "musical-notes", iconColor: "#E67E22", target: 1800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_10", title: "Melómano de Cartas 2000", description: "Escucha 2000 efectos de sonido.", icon: "musical-notes", iconColor: "#D4AF37", target: 2000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_11", title: "Melómano de Cartas 2200", description: "Escucha 2200 efectos de sonido.", icon: "musical-notes", iconColor: "#E74C3C", target: 2200, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_12", title: "Melómano de Cartas 2400", description: "Escucha 2400 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 2400, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_13", title: "Melómano de Cartas 2600", description: "Escucha 2600 efectos de sonido.", icon: "musical-notes", iconColor: "#A855F7", target: 2600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_14", title: "Melómano de Cartas 2800", description: "Escucha 2800 efectos de sonido.", icon: "musical-notes", iconColor: "#9B59B6", target: 2800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_15", title: "Melómano de Cartas 7500", description: "Escucha 7500 efectos de sonido.", icon: "musical-notes", iconColor: "#FFD700", target: 7500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_16", title: "Melómano de Cartas 8000", description: "Escucha 8000 efectos de sonido.", icon: "musical-notes", iconColor: "#E74C3C", target: 8000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_17", title: "Melómano de Cartas 8500", description: "Escucha 8500 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 8500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_18", title: "Melómano de Cartas 9000", description: "Escucha 9000 efectos de sonido.", icon: "musical-notes", iconColor: "#FFD700", target: 9000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_19", title: "Melómano de Cartas 9500", description: "Escucha 9500 efectos de sonido.", icon: "musical-notes", iconColor: "#FFD700", target: 9500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_20", title: "Melómano de Cartas 10000", description: "Escucha 10000 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 10000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_21", title: "Melómano de Cartas 10500", description: "Escucha 10500 efectos de sonido.", icon: "musical-notes", iconColor: "#E74C3C", target: 10500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_22", title: "Melómano de Cartas 22000", description: "Escucha 22000 efectos de sonido.", icon: "musical-notes", iconColor: "#1A8FC1", target: 22000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "audio_ext_23", title: "Melómano de Cartas 23000", description: "Escucha 23000 efectos de sonido.", icon: "musical-notes", iconColor: "#E67E22", target: 23000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_24", title: "Melómano de Cartas 24000", description: "Escucha 24000 efectos de sonido.", icon: "musical-notes", iconColor: "#FF6B00", target: 24000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_25", title: "Melómano de Cartas 25000", description: "Escucha 25000 efectos de sonido.", icon: "musical-notes", iconColor: "#D4AF37", target: 25000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_26", title: "Melómano de Cartas 26000", description: "Escucha 26000 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 26000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_27", title: "Melómano de Cartas 27000", description: "Escucha 27000 efectos de sonido.", icon: "musical-notes", iconColor: "#1A8FC1", target: 27000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_28", title: "Melómano de Cartas 28000", description: "Escucha 28000 efectos de sonido.", icon: "musical-notes", iconColor: "#A855F7", target: 28000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_29", title: "Melómano de Cartas 58000", description: "Escucha 58000 efectos de sonido.", icon: "musical-notes", iconColor: "#E74C3C", target: 58000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_30", title: "Melómano de Cartas 60000", description: "Escucha 60000 efectos de sonido.", icon: "musical-notes", iconColor: "#FF6B00", target: 60000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_31", title: "Melómano de Cartas 62000", description: "Escucha 62000 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 62000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "audio_ext_32", title: "Melómano de Cartas 64000", description: "Escucha 64000 efectos de sonido.", icon: "musical-notes", iconColor: "#1A8FC1", target: 64000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_33", title: "Melómano de Cartas 66000", description: "Escucha 66000 efectos de sonido.", icon: "musical-notes", iconColor: "#9B59B6", target: 66000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_34", title: "Melómano de Cartas 68000", description: "Escucha 68000 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 68000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_35", title: "Melómano de Cartas 70000", description: "Escucha 70000 efectos de sonido.", icon: "musical-notes", iconColor: "#C0C0C0", target: 70000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_36", title: "Melómano de Cartas 108000", description: "Escucha 108000 efectos de sonido.", icon: "musical-notes", iconColor: "#FF6B00", target: 108000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_37", title: "Melómano de Cartas 111000", description: "Escucha 111000 efectos de sonido.", icon: "musical-notes", iconColor: "#1A8FC1", target: 111000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_38", title: "Melómano de Cartas 114000", description: "Escucha 114000 efectos de sonido.", icon: "musical-notes", iconColor: "#FF6B00", target: 114000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_39", title: "Melómano de Cartas 117000", description: "Escucha 117000 efectos de sonido.", icon: "musical-notes", iconColor: "#C0C0C0", target: 117000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "audio_ext_40", title: "Melómano de Cartas 120000", description: "Escucha 120000 efectos de sonido.", icon: "musical-notes", iconColor: "#1A8FC1", target: 120000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_41", title: "Melómano de Cartas 123000", description: "Escucha 123000 efectos de sonido.", icon: "musical-notes", iconColor: "#A855F7", target: 123000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_42", title: "Melómano de Cartas 126000", description: "Escucha 126000 efectos de sonido.", icon: "musical-notes", iconColor: "#1A8FC1", target: 126000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_43", title: "Melómano de Cartas 172000", description: "Escucha 172000 efectos de sonido.", icon: "musical-notes", iconColor: "#FF6B00", target: 172000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_44", title: "Melómano de Cartas 176000", description: "Escucha 176000 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 176000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_45", title: "Melómano de Cartas 180000", description: "Escucha 180000 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 180000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_46", title: "Melómano de Cartas 184000", description: "Escucha 184000 efectos de sonido.", icon: "musical-notes", iconColor: "#E67E22", target: 184000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_47", title: "Melómano de Cartas 188000", description: "Escucha 188000 efectos de sonido.", icon: "musical-notes", iconColor: "#9B59B6", target: 188000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_48", title: "Melómano de Cartas 192000", description: "Escucha 192000 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 192000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_49", title: "Melómano de Cartas 196000", description: "Escucha 196000 efectos de sonido.", icon: "musical-notes", iconColor: "#C0C0C0", target: 196000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_50", title: "Melómano de Cartas 250000", description: "Escucha 250000 efectos de sonido.", icon: "musical-notes", iconColor: "#E67E22", target: 250000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "audio_ext_51", title: "Melómano de Cartas 255000", description: "Escucha 255000 efectos de sonido.", icon: "musical-notes", iconColor: "#E74C3C", target: 255000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_52", title: "Melómano de Cartas 260000", description: "Escucha 260000 efectos de sonido.", icon: "musical-notes", iconColor: "#A855F7", target: 260000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_53", title: "Melómano de Cartas 265000", description: "Escucha 265000 efectos de sonido.", icon: "musical-notes", iconColor: "#9B59B6", target: 265000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_54", title: "Melómano de Cartas 270000", description: "Escucha 270000 efectos de sonido.", icon: "musical-notes", iconColor: "#A855F7", target: 270000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_55", title: "Melómano de Cartas 275000", description: "Escucha 275000 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 275000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_56", title: "Melómano de Cartas 280000", description: "Escucha 280000 efectos de sonido.", icon: "musical-notes", iconColor: "#FFD700", target: 280000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_57", title: "Melómano de Cartas 427500", description: "Escucha 427500 efectos de sonido.", icon: "musical-notes", iconColor: "#E74C3C", target: 427500, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "audio_ext_58", title: "Melómano de Cartas 435000", description: "Escucha 435000 efectos de sonido.", icon: "musical-notes", iconColor: "#D4AF37", target: 435000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_59", title: "Melómano de Cartas 442500", description: "Escucha 442500 efectos de sonido.", icon: "musical-notes", iconColor: "#9B59B6", target: 442500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_60", title: "Melómano de Cartas 450000", description: "Escucha 450000 efectos de sonido.", icon: "musical-notes", iconColor: "#1A8FC1", target: 450000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_61", title: "Melómano de Cartas 457500", description: "Escucha 457500 efectos de sonido.", icon: "musical-notes", iconColor: "#9B59B6", target: 457500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_62", title: "Melómano de Cartas 465000", description: "Escucha 465000 efectos de sonido.", icon: "musical-notes", iconColor: "#FF6B00", target: 465000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_63", title: "Melómano de Cartas 472500", description: "Escucha 472500 efectos de sonido.", icon: "musical-notes", iconColor: "#FF6B00", target: 472500, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_64", title: "Melómano de Cartas 640000", description: "Escucha 640000 efectos de sonido.", icon: "musical-notes", iconColor: "#C0C0C0", target: 640000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "audio_ext_65", title: "Melómano de Cartas 650000", description: "Escucha 650000 efectos de sonido.", icon: "musical-notes", iconColor: "#FFD700", target: 650000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_66", title: "Melómano de Cartas 660000", description: "Escucha 660000 efectos de sonido.", icon: "musical-notes", iconColor: "#FFD700", target: 660000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "audio_ext_67", title: "Melómano de Cartas 670000", description: "Escucha 670000 efectos de sonido.", icon: "musical-notes", iconColor: "#C0C0C0", target: 670000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_68", title: "Melómano de Cartas 680000", description: "Escucha 680000 efectos de sonido.", icon: "musical-notes", iconColor: "#D4AF37", target: 680000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "audio_ext_69", title: "Melómano de Cartas 690000", description: "Escucha 690000 efectos de sonido.", icon: "musical-notes", iconColor: "#27AE60", target: 690000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "audio_ext_70", title: "Melómano de Cartas 700000", description: "Escucha 700000 efectos de sonido.", icon: "musical-notes", iconColor: "#1A8FC1", target: 700000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "room_ext_1", title: "Anfitrión de Sala 10", description: "Crea o únete a 10 salas privadas.", icon: "key", iconColor: "#E74C3C", target: 10, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_2", title: "Anfitrión de Sala 20", description: "Crea o únete a 20 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 20, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_3", title: "Anfitrión de Sala 30", description: "Crea o únete a 30 salas privadas.", icon: "key", iconColor: "#27AE60", target: 30, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_4", title: "Anfitrión de Sala 40", description: "Crea o únete a 40 salas privadas.", icon: "key", iconColor: "#27AE60", target: 40, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_5", title: "Anfitrión de Sala 50", description: "Crea o únete a 50 salas privadas.", icon: "key", iconColor: "#27AE60", target: 50, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_6", title: "Anfitrión de Sala 60", description: "Crea o únete a 60 salas privadas.", icon: "key", iconColor: "#FFD700", target: 60, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_7", title: "Anfitrión de Sala 70", description: "Crea o únete a 70 salas privadas.", icon: "key", iconColor: "#FF6B00", target: 70, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_8", title: "Anfitrión de Sala 200", description: "Crea o únete a 200 salas privadas.", icon: "key", iconColor: "#1A8FC1", target: 200, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "room_ext_9", title: "Anfitrión de Sala 225", description: "Crea o únete a 225 salas privadas.", icon: "key", iconColor: "#9B59B6", target: 225, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_10", title: "Anfitrión de Sala 250", description: "Crea o únete a 250 salas privadas.", icon: "key", iconColor: "#E74C3C", target: 250, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_11", title: "Anfitrión de Sala 275", description: "Crea o únete a 275 salas privadas.", icon: "key", iconColor: "#C0C0C0", target: 275, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_12", title: "Anfitrión de Sala 300", description: "Crea o únete a 300 salas privadas.", icon: "key", iconColor: "#FF6B00", target: 300, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_13", title: "Anfitrión de Sala 325", description: "Crea o únete a 325 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 325, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_14", title: "Anfitrión de Sala 350", description: "Crea o únete a 350 salas privadas.", icon: "key", iconColor: "#FFD700", target: 350, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_15", title: "Anfitrión de Sala 750", description: "Crea o únete a 750 salas privadas.", icon: "key", iconColor: "#C0C0C0", target: 750, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_16", title: "Anfitrión de Sala 800", description: "Crea o únete a 800 salas privadas.", icon: "key", iconColor: "#A855F7", target: 800, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_17", title: "Anfitrión de Sala 850", description: "Crea o únete a 850 salas privadas.", icon: "key", iconColor: "#FFD700", target: 850, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_18", title: "Anfitrión de Sala 900", description: "Crea o únete a 900 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 900, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_19", title: "Anfitrión de Sala 950", description: "Crea o únete a 950 salas privadas.", icon: "key", iconColor: "#1A8FC1", target: 950, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_20", title: "Anfitrión de Sala 1000", description: "Crea o únete a 1000 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 1000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_21", title: "Anfitrión de Sala 1050", description: "Crea o únete a 1050 salas privadas.", icon: "key", iconColor: "#FFD700", target: 1050, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_22", title: "Anfitrión de Sala 2200", description: "Crea o únete a 2200 salas privadas.", icon: "key", iconColor: "#FF6B00", target: 2200, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_23", title: "Anfitrión de Sala 2300", description: "Crea o únete a 2300 salas privadas.", icon: "key", iconColor: "#FFD700", target: 2300, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_24", title: "Anfitrión de Sala 2400", description: "Crea o únete a 2400 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 2400, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_25", title: "Anfitrión de Sala 2500", description: "Crea o únete a 2500 salas privadas.", icon: "key", iconColor: "#1A8FC1", target: 2500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_26", title: "Anfitrión de Sala 2600", description: "Crea o únete a 2600 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 2600, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "room_ext_27", title: "Anfitrión de Sala 2700", description: "Crea o únete a 2700 salas privadas.", icon: "key", iconColor: "#FF6B00", target: 2700, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_28", title: "Anfitrión de Sala 2800", description: "Crea o únete a 2800 salas privadas.", icon: "key", iconColor: "#C0C0C0", target: 2800, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_29", title: "Anfitrión de Sala 5800", description: "Crea o únete a 5800 salas privadas.", icon: "key", iconColor: "#E74C3C", target: 5800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_30", title: "Anfitrión de Sala 6000", description: "Crea o únete a 6000 salas privadas.", icon: "key", iconColor: "#E67E22", target: 6000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_31", title: "Anfitrión de Sala 6200", description: "Crea o únete a 6200 salas privadas.", icon: "key", iconColor: "#27AE60", target: 6200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_32", title: "Anfitrión de Sala 6400", description: "Crea o únete a 6400 salas privadas.", icon: "key", iconColor: "#FFD700", target: 6400, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_33", title: "Anfitrión de Sala 6600", description: "Crea o únete a 6600 salas privadas.", icon: "key", iconColor: "#9B59B6", target: 6600, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_34", title: "Anfitrión de Sala 6800", description: "Crea o únete a 6800 salas privadas.", icon: "key", iconColor: "#E74C3C", target: 6800, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_35", title: "Anfitrión de Sala 7000", description: "Crea o únete a 7000 salas privadas.", icon: "key", iconColor: "#A855F7", target: 7000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_36", title: "Anfitrión de Sala 10800", description: "Crea o únete a 10800 salas privadas.", icon: "key", iconColor: "#1A8FC1", target: 10800, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_37", title: "Anfitrión de Sala 11100", description: "Crea o únete a 11100 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 11100, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_38", title: "Anfitrión de Sala 11400", description: "Crea o únete a 11400 salas privadas.", icon: "key", iconColor: "#1A8FC1", target: 11400, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_39", title: "Anfitrión de Sala 11700", description: "Crea o únete a 11700 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 11700, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_40", title: "Anfitrión de Sala 12000", description: "Crea o únete a 12000 salas privadas.", icon: "key", iconColor: "#1A8FC1", target: 12000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_41", title: "Anfitrión de Sala 12300", description: "Crea o únete a 12300 salas privadas.", icon: "key", iconColor: "#27AE60", target: 12300, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_42", title: "Anfitrión de Sala 12600", description: "Crea o únete a 12600 salas privadas.", icon: "key", iconColor: "#27AE60", target: 12600, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_43", title: "Anfitrión de Sala 17200", description: "Crea o únete a 17200 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 17200, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "room_ext_44", title: "Anfitrión de Sala 17600", description: "Crea o únete a 17600 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 17600, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_45", title: "Anfitrión de Sala 18000", description: "Crea o únete a 18000 salas privadas.", icon: "key", iconColor: "#C0C0C0", target: 18000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_46", title: "Anfitrión de Sala 18400", description: "Crea o únete a 18400 salas privadas.", icon: "key", iconColor: "#E74C3C", target: 18400, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_47", title: "Anfitrión de Sala 18800", description: "Crea o únete a 18800 salas privadas.", icon: "key", iconColor: "#27AE60", target: 18800, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_48", title: "Anfitrión de Sala 19200", description: "Crea o únete a 19200 salas privadas.", icon: "key", iconColor: "#FF6B00", target: 19200, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_49", title: "Anfitrión de Sala 19600", description: "Crea o únete a 19600 salas privadas.", icon: "key", iconColor: "#FFD700", target: 19600, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_50", title: "Anfitrión de Sala 25000", description: "Crea o únete a 25000 salas privadas.", icon: "key", iconColor: "#1A8FC1", target: 25000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_51", title: "Anfitrión de Sala 25500", description: "Crea o únete a 25500 salas privadas.", icon: "key", iconColor: "#1A8FC1", target: 25500, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "room_ext_52", title: "Anfitrión de Sala 26000", description: "Crea o únete a 26000 salas privadas.", icon: "key", iconColor: "#E67E22", target: 26000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_53", title: "Anfitrión de Sala 26500", description: "Crea o únete a 26500 salas privadas.", icon: "key", iconColor: "#E67E22", target: 26500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_54", title: "Anfitrión de Sala 27000", description: "Crea o únete a 27000 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 27000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_55", title: "Anfitrión de Sala 27500", description: "Crea o únete a 27500 salas privadas.", icon: "key", iconColor: "#A855F7", target: 27500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_56", title: "Anfitrión de Sala 28000", description: "Crea o únete a 28000 salas privadas.", icon: "key", iconColor: "#9B59B6", target: 28000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_57", title: "Anfitrión de Sala 42750", description: "Crea o únete a 42750 salas privadas.", icon: "key", iconColor: "#27AE60", target: 42750, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_58", title: "Anfitrión de Sala 43500", description: "Crea o únete a 43500 salas privadas.", icon: "key", iconColor: "#FFD700", target: 43500, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_59", title: "Anfitrión de Sala 44250", description: "Crea o únete a 44250 salas privadas.", icon: "key", iconColor: "#FFD700", target: 44250, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_60", title: "Anfitrión de Sala 45000", description: "Crea o únete a 45000 salas privadas.", icon: "key", iconColor: "#FF6B00", target: 45000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "room_ext_61", title: "Anfitrión de Sala 45750", description: "Crea o únete a 45750 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 45750, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_62", title: "Anfitrión de Sala 46500", description: "Crea o únete a 46500 salas privadas.", icon: "key", iconColor: "#1A8FC1", target: 46500, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_63", title: "Anfitrión de Sala 47250", description: "Crea o únete a 47250 salas privadas.", icon: "key", iconColor: "#E67E22", target: 47250, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_64", title: "Anfitrión de Sala 64000", description: "Crea o únete a 64000 salas privadas.", icon: "key", iconColor: "#E74C3C", target: 64000, coinsReward: 500, xpReward: 1000, rarity: "epic" },
  { id: "room_ext_65", title: "Anfitrión de Sala 65000", description: "Crea o únete a 65000 salas privadas.", icon: "key", iconColor: "#C0C0C0", target: 65000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_66", title: "Anfitrión de Sala 66000", description: "Crea o únete a 66000 salas privadas.", icon: "key", iconColor: "#D4AF37", target: 66000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "room_ext_67", title: "Anfitrión de Sala 67000", description: "Crea o únete a 67000 salas privadas.", icon: "key", iconColor: "#E67E22", target: 67000, coinsReward: 1000, xpReward: 2500, rarity: "legendary" },
  { id: "room_ext_68", title: "Anfitrión de Sala 68000", description: "Crea o únete a 68000 salas privadas.", icon: "key", iconColor: "#C0C0C0", target: 68000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_69", title: "Anfitrión de Sala 69000", description: "Crea o únete a 69000 salas privadas.", icon: "key", iconColor: "#27AE60", target: 69000, coinsReward: 50, xpReward: 100, rarity: "common" },
  { id: "room_ext_70", title: "Anfitrión de Sala 70000", description: "Crea o únete a 70000 salas privadas.", icon: "key", iconColor: "#27AE60", target: 70000, coinsReward: 150, xpReward: 300, rarity: "rare" },
  { id: "secret_ext_1", title: "Secreto 1", description: "Desbloquea el secreto número 1.", icon: "help-circle", iconColor: "#1A8FC1", target: 1, coinsReward: 500, xpReward: 1000, rarity: "epic", hidden: true },
  { id: "secret_ext_2", title: "Secreto 2", description: "Desbloquea el secreto número 2.", icon: "help-circle", iconColor: "#1A8FC1", target: 2, coinsReward: 500, xpReward: 1000, rarity: "epic", hidden: true },
  { id: "secret_ext_3", title: "Secreto 3", description: "Desbloquea el secreto número 3.", icon: "help-circle", iconColor: "#27AE60", target: 3, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_4", title: "Secreto 4", description: "Desbloquea el secreto número 4.", icon: "help-circle", iconColor: "#D4AF37", target: 4, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_5", title: "Secreto 5", description: "Desbloquea el secreto número 5.", icon: "help-circle", iconColor: "#E74C3C", target: 5, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_6", title: "Secreto 6", description: "Desbloquea el secreto número 6.", icon: "help-circle", iconColor: "#FF6B00", target: 6, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_7", title: "Secreto 7", description: "Desbloquea el secreto número 7.", icon: "help-circle", iconColor: "#FF6B00", target: 7, coinsReward: 1000, xpReward: 2500, rarity: "legendary", hidden: true },
  { id: "secret_ext_8", title: "Secreto 16", description: "Desbloquea el secreto número 16.", icon: "help-circle", iconColor: "#C0C0C0", target: 16, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_9", title: "Secreto 18", description: "Desbloquea el secreto número 18.", icon: "help-circle", iconColor: "#9B59B6", target: 18, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_10", title: "Secreto 20", description: "Desbloquea el secreto número 20.", icon: "help-circle", iconColor: "#FFD700", target: 20, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_11", title: "Secreto 22", description: "Desbloquea el secreto número 22.", icon: "help-circle", iconColor: "#1A8FC1", target: 22, coinsReward: 500, xpReward: 1000, rarity: "epic", hidden: true },
  { id: "secret_ext_12", title: "Secreto 24", description: "Desbloquea el secreto número 24.", icon: "help-circle", iconColor: "#1A8FC1", target: 24, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_13", title: "Secreto 26", description: "Desbloquea el secreto número 26.", icon: "help-circle", iconColor: "#FF6B00", target: 26, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_14", title: "Secreto 28", description: "Desbloquea el secreto número 28.", icon: "help-circle", iconColor: "#9B59B6", target: 28, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_15", title: "Secreto 45", description: "Desbloquea el secreto número 45.", icon: "help-circle", iconColor: "#A855F7", target: 45, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_16", title: "Secreto 48", description: "Desbloquea el secreto número 48.", icon: "help-circle", iconColor: "#A855F7", target: 48, coinsReward: 1000, xpReward: 2500, rarity: "legendary", hidden: true },
  { id: "secret_ext_17", title: "Secreto 51", description: "Desbloquea el secreto número 51.", icon: "help-circle", iconColor: "#FFD700", target: 51, coinsReward: 500, xpReward: 1000, rarity: "epic", hidden: true },
  { id: "secret_ext_18", title: "Secreto 54", description: "Desbloquea el secreto número 54.", icon: "help-circle", iconColor: "#9B59B6", target: 54, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_19", title: "Secreto 57", description: "Desbloquea el secreto número 57.", icon: "help-circle", iconColor: "#D4AF37", target: 57, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_20", title: "Secreto 60", description: "Desbloquea el secreto número 60.", icon: "help-circle", iconColor: "#D4AF37", target: 60, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_21", title: "Secreto 63", description: "Desbloquea el secreto número 63.", icon: "help-circle", iconColor: "#FF6B00", target: 63, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_22", title: "Secreto 88", description: "Desbloquea el secreto número 88.", icon: "help-circle", iconColor: "#9B59B6", target: 88, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_23", title: "Secreto 92", description: "Desbloquea el secreto número 92.", icon: "help-circle", iconColor: "#E67E22", target: 92, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_24", title: "Secreto 96", description: "Desbloquea el secreto número 96.", icon: "help-circle", iconColor: "#FF6B00", target: 96, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_25", title: "Secreto 100", description: "Desbloquea el secreto número 100.", icon: "help-circle", iconColor: "#C0C0C0", target: 100, coinsReward: 500, xpReward: 1000, rarity: "epic", hidden: true },
  { id: "secret_ext_26", title: "Secreto 104", description: "Desbloquea el secreto número 104.", icon: "help-circle", iconColor: "#FF6B00", target: 104, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_27", title: "Secreto 108", description: "Desbloquea el secreto número 108.", icon: "help-circle", iconColor: "#A855F7", target: 108, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_28", title: "Secreto 112", description: "Desbloquea el secreto número 112.", icon: "help-circle", iconColor: "#A855F7", target: 112, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_29", title: "Secreto 145", description: "Desbloquea el secreto número 145.", icon: "help-circle", iconColor: "#D4AF37", target: 145, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_30", title: "Secreto 150", description: "Desbloquea el secreto número 150.", icon: "help-circle", iconColor: "#FFD700", target: 150, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_31", title: "Secreto 155", description: "Desbloquea el secreto número 155.", icon: "help-circle", iconColor: "#E67E22", target: 155, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_32", title: "Secreto 160", description: "Desbloquea el secreto número 160.", icon: "help-circle", iconColor: "#E74C3C", target: 160, coinsReward: 500, xpReward: 1000, rarity: "epic", hidden: true },
  { id: "secret_ext_33", title: "Secreto 165", description: "Desbloquea el secreto número 165.", icon: "help-circle", iconColor: "#1A8FC1", target: 165, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_34", title: "Secreto 170", description: "Desbloquea el secreto número 170.", icon: "help-circle", iconColor: "#E67E22", target: 170, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_35", title: "Secreto 175", description: "Desbloquea el secreto número 175.", icon: "help-circle", iconColor: "#27AE60", target: 175, coinsReward: 1000, xpReward: 2500, rarity: "legendary", hidden: true },
  { id: "secret_ext_36", title: "Secreto 360", description: "Desbloquea el secreto número 360.", icon: "help-circle", iconColor: "#A855F7", target: 360, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_37", title: "Secreto 370", description: "Desbloquea el secreto número 370.", icon: "help-circle", iconColor: "#1A8FC1", target: 370, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_38", title: "Secreto 380", description: "Desbloquea el secreto número 380.", icon: "help-circle", iconColor: "#D4AF37", target: 380, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_39", title: "Secreto 390", description: "Desbloquea el secreto número 390.", icon: "help-circle", iconColor: "#E74C3C", target: 390, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_40", title: "Secreto 400", description: "Desbloquea el secreto número 400.", icon: "help-circle", iconColor: "#D4AF37", target: 400, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_41", title: "Secreto 410", description: "Desbloquea el secreto número 410.", icon: "help-circle", iconColor: "#1A8FC1", target: 410, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_42", title: "Secreto 420", description: "Desbloquea el secreto número 420.", icon: "help-circle", iconColor: "#27AE60", target: 420, coinsReward: 1000, xpReward: 2500, rarity: "legendary", hidden: true },
  { id: "secret_ext_43", title: "Secreto 645", description: "Desbloquea el secreto número 645.", icon: "help-circle", iconColor: "#D4AF37", target: 645, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_44", title: "Secreto 660", description: "Desbloquea el secreto número 660.", icon: "help-circle", iconColor: "#E67E22", target: 660, coinsReward: 1000, xpReward: 2500, rarity: "legendary", hidden: true },
  { id: "secret_ext_45", title: "Secreto 675", description: "Desbloquea el secreto número 675.", icon: "help-circle", iconColor: "#E74C3C", target: 675, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_46", title: "Secreto 690", description: "Desbloquea el secreto número 690.", icon: "help-circle", iconColor: "#E74C3C", target: 690, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_47", title: "Secreto 705", description: "Desbloquea el secreto número 705.", icon: "help-circle", iconColor: "#D4AF37", target: 705, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_48", title: "Secreto 720", description: "Desbloquea el secreto número 720.", icon: "help-circle", iconColor: "#FF6B00", target: 720, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_49", title: "Secreto 735", description: "Desbloquea el secreto número 735.", icon: "help-circle", iconColor: "#A855F7", target: 735, coinsReward: 500, xpReward: 1000, rarity: "epic", hidden: true },
  { id: "secret_ext_50", title: "Secreto 1000", description: "Desbloquea el secreto número 1000.", icon: "help-circle", iconColor: "#1A8FC1", target: 1000, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_51", title: "Secreto 1020", description: "Desbloquea el secreto número 1020.", icon: "help-circle", iconColor: "#A855F7", target: 1020, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_52", title: "Secreto 1040", description: "Desbloquea el secreto número 1040.", icon: "help-circle", iconColor: "#27AE60", target: 1040, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_53", title: "Secreto 1060", description: "Desbloquea el secreto número 1060.", icon: "help-circle", iconColor: "#27AE60", target: 1060, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_54", title: "Secreto 1080", description: "Desbloquea el secreto número 1080.", icon: "help-circle", iconColor: "#E74C3C", target: 1080, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_55", title: "Secreto 1100", description: "Desbloquea el secreto número 1100.", icon: "help-circle", iconColor: "#A855F7", target: 1100, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_56", title: "Secreto 1120", description: "Desbloquea el secreto número 1120.", icon: "help-circle", iconColor: "#27AE60", target: 1120, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_57", title: "Secreto 1425", description: "Desbloquea el secreto número 1425.", icon: "help-circle", iconColor: "#A855F7", target: 1425, coinsReward: 500, xpReward: 1000, rarity: "epic", hidden: true },
  { id: "secret_ext_58", title: "Secreto 1450", description: "Desbloquea el secreto número 1450.", icon: "help-circle", iconColor: "#FF6B00", target: 1450, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_59", title: "Secreto 1475", description: "Desbloquea el secreto número 1475.", icon: "help-circle", iconColor: "#27AE60", target: 1475, coinsReward: 500, xpReward: 1000, rarity: "epic", hidden: true },
  { id: "secret_ext_60", title: "Secreto 1500", description: "Desbloquea el secreto número 1500.", icon: "help-circle", iconColor: "#FF6B00", target: 1500, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_61", title: "Secreto 1525", description: "Desbloquea el secreto número 1525.", icon: "help-circle", iconColor: "#9B59B6", target: 1525, coinsReward: 500, xpReward: 1000, rarity: "epic", hidden: true },
  { id: "secret_ext_62", title: "Secreto 1550", description: "Desbloquea el secreto número 1550.", icon: "help-circle", iconColor: "#27AE60", target: 1550, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_63", title: "Secreto 1575", description: "Desbloquea el secreto número 1575.", icon: "help-circle", iconColor: "#FFD700", target: 1575, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_64", title: "Secreto 3200", description: "Desbloquea el secreto número 3200.", icon: "help-circle", iconColor: "#27AE60", target: 3200, coinsReward: 1000, xpReward: 2500, rarity: "legendary", hidden: true },
  { id: "secret_ext_65", title: "Secreto 3250", description: "Desbloquea el secreto número 3250.", icon: "help-circle", iconColor: "#1A8FC1", target: 3250, coinsReward: 1000, xpReward: 2500, rarity: "legendary", hidden: true },
  { id: "secret_ext_66", title: "Secreto 3300", description: "Desbloquea el secreto número 3300.", icon: "help-circle", iconColor: "#1A8FC1", target: 3300, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_67", title: "Secreto 3350", description: "Desbloquea el secreto número 3350.", icon: "help-circle", iconColor: "#FF6B00", target: 3350, coinsReward: 150, xpReward: 300, rarity: "rare", hidden: true },
  { id: "secret_ext_68", title: "Secreto 3400", description: "Desbloquea el secreto número 3400.", icon: "help-circle", iconColor: "#E67E22", target: 3400, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_69", title: "Secreto 3450", description: "Desbloquea el secreto número 3450.", icon: "help-circle", iconColor: "#E74C3C", target: 3450, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true },
  { id: "secret_ext_70", title: "Secreto 3500", description: "Desbloquea el secreto número 3500.", icon: "help-circle", iconColor: "#D4AF37", target: 3500, coinsReward: 50, xpReward: 100, rarity: "common", hidden: true }];

export const RARITY_COLORS = {
  common: "#95A5A6",
  rare: "#2196F3",
  epic: "#9B59B6",
  legendary: "#D4AF37",
};

export function getAchievementById(id: AchievementId): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
