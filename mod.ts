import type {
  Context,
  MiddlewareFn,
  MiddlewareObj,
} from "https://deno.land/x/grammy@v1.30.0/mod.ts";
import type { ChatMember } from "https://deno.land/x/grammy@v1.30.0/types.ts";
import {
  ChatMemberStatus,
  ChatType,
  type Entry,
  MessageType,
  UpdateDispatcher,
  UpdateType,
} from "jsr:@tmetrik/core@0.0";

export class Tmetrik extends UpdateDispatcher implements MiddlewareObj {
  middleware(): MiddlewareFn {
    return (ctx, next) => {
      const entry = constructEntry(ctx);
      if (entry != null) {
        this.addEntry(entry);
      }
      if (this.thresholdReached) {
        return Promise.all([this.dispatch(), next()]);
      } else {
        return next();
      }
    };
  }
}

function constructEntry(ctx: Context): Entry | null {
  let updateType: UpdateType | null;
  if (ctx.message || ctx.channelPost || ctx.businessMessage) {
    updateType = UpdateType.Message;
  } else if (
    ctx.editedMessage || ctx.editedChannelPost || ctx.editedBusinessMessage
  ) {
    updateType = UpdateType.MessageEdited;
  } else if (ctx.deletedBusinessMessages) {
    updateType = UpdateType.MessagesDeleted;
  } else if (ctx.callbackQuery) {
    updateType = UpdateType.CallbackQuery;
  } else if (ctx.chatBoost) {
    updateType = UpdateType.ChatBoostRemoved;
  } else if (ctx.removedChatBoost) {
    updateType = UpdateType.ChatBoostRemoved;
  } else if (ctx.inlineQuery) {
    updateType = UpdateType.InlineQuery;
  } else if (ctx.chosenInlineResult) {
    updateType = UpdateType.InlineResultChosen;
  } else if (ctx.chatJoinRequest) {
    updateType = UpdateType.JoinRequest;
  } else if (ctx.chatMember) {
    updateType = UpdateType.ChatMember;
  } else if (ctx.myChatMember) {
    updateType = UpdateType.ChatMemberMy;
  } else if (ctx.messageReactionCount) {
    updateType = UpdateType.MessageReactionCount;
  } else if (ctx.messageReaction) {
    updateType = UpdateType.MessageReactions;
  } else {
    updateType = null;
  }
  if (updateType == null) {
    return null;
  }

  let chat;
  let fromType: ChatType | null = null;
  if (ctx.from) {
    fromType = ChatType.User;
    // deno-lint-ignore no-cond-assign
  } else if (chat = ctx.senderChat ?? ctx.chat) {
    if (chat.is_forum) {
      fromType = ChatType.Forum;
    } else if (chat.type == "supergroup") {
      fromType = ChatType.Supergroup;
    } else if (chat.type == "channel") {
      fromType = ChatType.Channel;
    } else if (chat.type == "group") {
      fromType = ChatType.Group;
    }
  }
  if (fromType == null) {
    return null;
  }

  let chatType = ChatType.Unknown;
  if (ctx.chat) {
    if (ctx.chat.is_forum) {
      chatType = ChatType.Forum;
    } else if (ctx.chat.type == "supergroup") {
      chatType = ChatType.Supergroup;
    } else if (ctx.chat.type == "channel") {
      chatType = ChatType.Channel;
    } else if (ctx.chat.type == "group") {
      chatType = ChatType.Group;
    } else if (ctx.chat.type == "private") {
      chatType = ChatType.User;
    }
  }

  let messageType = MessageType.Unsupported;
  if (ctx.msg) {
    if (ctx.msg.text) {
      messageType = MessageType.Text;
    } else if (ctx.msg.link_preview_options?.url) {
      messageType = MessageType.Link;
    } else if (ctx.msg.photo) {
      messageType = MessageType.Photo;
    } else if (ctx.msg.document) {
      messageType = MessageType.Document;
    } else if (ctx.msg.video) {
      messageType = MessageType.Video;
    } else if (ctx.msg.sticker) {
      messageType = MessageType.Sticker;
    } else if (ctx.msg.animation) {
      messageType = MessageType.Animation;
    } else if (ctx.msg.voice) {
      messageType = MessageType.Voice;
    } else if (ctx.msg.audio) {
      messageType = MessageType.Audio;
    } else if (ctx.msg.dice) {
      messageType = MessageType.Dice;
    } else if (ctx.msg.video_note) {
      messageType = MessageType.VideoNote;
    } else if (ctx.msg.contact) {
      messageType = MessageType.Contact;
    } else if (ctx.msg.game) {
      messageType = MessageType.Game;
    } else if (ctx.msg.poll) {
      messageType = MessageType.Poll;
    } else if (ctx.msg.invoice) {
      messageType = MessageType.Invoice;
    } else if (ctx.msg.venue) {
      messageType = MessageType.Venue;
    } else if (ctx.msg.location) {
      messageType = MessageType.Location;
    } else if (ctx.msg.new_chat_members) {
      messageType = MessageType.NewChatMembers;
    } else if (ctx.msg.left_chat_member) {
      messageType = MessageType.LeftChatMember;
    } else if (ctx.msg.new_chat_title) {
      messageType = MessageType.NewChatTitle;
    } else if (ctx.msg.new_chat_photo) {
      messageType = MessageType.NewChatPhoto;
    } else if (ctx.msg.delete_chat_photo) {
      messageType = MessageType.DeletedChatPhoto;
    } else if (ctx.msg.group_chat_created) {
      messageType = MessageType.GroupCreated;
    } else if (ctx.msg.supergroup_chat_created) {
      messageType = MessageType.SupergroupCreated;
    } else if (ctx.msg.channel_chat_created) {
      messageType = MessageType.ChannelCreated;
    } else if (ctx.msg.message_auto_delete_timer_changed) {
      messageType = MessageType.AutoDeleteTimerChanged;
    } else if (ctx.msg.migrate_to_chat_id) {
      messageType = MessageType.ChatMigratedTo;
    } else if (ctx.msg.migrate_from_chat_id) {
      messageType = MessageType.ChatMigratedFrom;
    } else if (ctx.msg.pinned_message) {
      messageType = MessageType.PinnedMessage;
    } else if (ctx.msg.users_shared) {
      messageType = MessageType.UserShared;
    } else if (ctx.msg.write_access_allowed) {
      messageType = MessageType.WriteAccessAllowed;
    } else if (ctx.msg.forum_topic_created) {
      messageType = MessageType.ForumTopicCreated;
    } else if (ctx.msg.forum_topic_edited) {
      messageType = MessageType.ForumTopicEdited;
    } else if (ctx.msg.forum_topic_closed) {
      messageType = MessageType.ForumTopicClosed;
    } else if (ctx.msg.forum_topic_reopened) {
      messageType = MessageType.ForumTopicReopened;
    } else if (ctx.msg.video_chat_scheduled) {
      messageType = MessageType.VideoChatScheduled;
    } else if (ctx.msg.video_chat_started) {
      messageType = MessageType.VideoChatStarted;
    } else if (ctx.msg.video_chat_ended) {
      messageType = MessageType.VideoChatEnded;
    } else if (ctx.msg.giveaway) {
      messageType = MessageType.Giveaway;
    } else if (ctx.msg.successful_payment) {
      messageType = MessageType.SuccessfulPayment;
    } else if (ctx.msg.refunded_payment) {
      messageType = MessageType.RefundedPayment;
    }
  }

  let forwardFrom: number | undefined;
  if (ctx.msg?.forward_origin) {
    switch (ctx.msg.forward_origin.type) {
      case "user":
        forwardFrom = ctx.msg.forward_origin.sender_user.id;
        break;
      case "channel":
        forwardFrom = ctx.msg.forward_origin.chat.id;
        break;
      case "chat":
        forwardFrom = ctx.msg.forward_origin.sender_chat.id;
    }
  }

  let forwardName: string | undefined;
  if (ctx.msg?.forward_origin) {
    switch (ctx.msg.forward_origin.type) {
      case "user":
        forwardName = ctx.msg.forward_origin.sender_user.first_name;
        if (ctx.msg.forward_origin.sender_user.last_name) {
          forwardName += " ";
          forwardName += ctx.msg.forward_origin.sender_user.last_name;
          forwardName = forwardName.trim();
        }
        break;
      case "channel":
        forwardName = ctx.msg.forward_origin.chat.title;
        break;
      case "chat":
        forwardName = ctx.msg.forward_origin.sender_chat.title;
        break;
      case "hidden_user":
        forwardName = ctx.msg.forward_origin.sender_user_name;
    }
  }

  const timestamp = new Date();
  const type = updateType;
  const to = ctx.me.id;
  const from = ctx.from?.id || ctx.senderChat?.id || ctx.chat?.id;
  if (!from) {
    return null;
  }

  const from_bot = ctx.from?.is_bot || false;
  const from_firstname = ctx.from?.first_name ?? "";
  const from_lastname = ctx.from?.last_name ?? "";
  const from_username = ctx.from?.username ?? ctx.senderChat?.username ?? "";
  const from_languagecode = ctx.from?.language_code ?? "";
  const from_premium = ctx.from?.is_premium || false;
  const from_type = fromType;
  const from_title = ctx.senderChat?.title ?? "";
  const from_businessconnection = ctx.businessConnectionId ?? "";
  const from_boostcount = ctx.msg?.sender_boost_count ?? 0;
  const from_signature = ctx.msg?.author_signature ?? "";

  const to_bot = true;
  const to_firstname = ctx.me.first_name;
  const to_lastname = ctx.me.last_name ?? "";
  const to_username = ctx.me.username;

  const chat_id = ctx.chatId ?? 0;
  const chat_username = ctx.chat?.username ?? "";
  const chat_title = ctx.chat?.title ?? "";
  const chat_firstname = ctx.chat?.first_name ?? "";
  const chat_lastname = ctx.chat?.last_name ?? "";
  const chat_type = chatType;

  const message_type = messageType;
  const message_id = ctx.msgId ?? 0;
  const message_threadid = ctx.msg?.message_thread_id ?? 0;
  const message_date = new Date((ctx.msg?.date ?? 0) * 1_000);
  const message_topic = ctx.msg?.is_topic_message ?? false;
  const message_automaticforward = ctx.msg?.is_automatic_forward ?? false;
  const message_effectid = ctx.msg?.effect_id ?? "";
  const message_replytomessageid = ctx.msg?.external_reply?.message_id ?? 0;
  const message_quotetext = ctx.msg?.quote?.text ?? "";

  const forward_date = new Date((ctx.msg?.forward_origin?.date ?? 0) * 1_000);
  const forward_from = forwardFrom ?? 0;
  const forward_messageid =
    ctx.msg?.forward_origin && "message_id" in ctx.msg.forward_origin
      ? ctx.msg.forward_origin.message_id
      : 0;
  const forward_signature =
    (ctx.msg?.forward_origin && "author_signature" in ctx.msg.forward_origin
      ? ctx.msg.forward_origin.author_signature
      : "") ?? "";
  const forward_bot =
    (ctx.msg?.forward_origin && ctx.msg.forward_origin.type == "user" &&
      ctx.msg.forward_origin.sender_user.is_bot) ?? false;
  const forward_name = forwardName ?? "";

  const message_text = ctx.msg?.text ?? ctx.msg?.caption ?? "";

  const message_url = ctx.msg?.link_preview_options?.url ?? "";

  const dice_emoji = ctx.msg?.dice?.emoji ?? "";
  const dice_value = ctx.msg?.dice?.value ?? 0;

  const callbackquery_id = ctx.callbackQuery?.id ?? "";
  const callbackquery_inlinemessageid = ctx.callbackQuery?.inline_message_id ??
    "";
  const callbackquery_data = ctx.callbackQuery?.data ?? "";

  const inlinequery_id = ctx.inlineQuery?.id ?? "";
  const inlinequery_text = ctx.inlineQuery?.query ?? "";
  const inlinequery_offset = ctx.inlineQuery?.offset ?? "";

  const inlineresultchosen_id = ctx.chosenInlineResult?.result_id ?? "";
  const inlineresultchosen_query = ctx.chosenInlineResult?.query ?? "";
  const inlineresultchosen_inlinemessageid =
    ctx.chosenInlineResult?.inline_message_id ?? "";

  const chatmember_id = ctx.chatMember?.new_chat_member.user.id ?? 0;
  const chatmember_bot = ctx.chatMember?.new_chat_member.user.is_bot ?? false;
  const chatmember_firstname =
    ctx.chatMember?.new_chat_member.user.first_name ?? "";
  const chatmember_lastname = ctx.chatMember?.new_chat_member.user.last_name ??
    "";
  const chatmember_username = ctx.chatMember?.new_chat_member.user.username ??
    "";
  const chatmember_premium = ctx.chatMember?.new_chat_member.user.is_premium ??
    false;
  const chatmember_oldstatus = getChatMemberStatus(
    ctx.chatMember?.old_chat_member,
  );
  const chatmember_newstatus = getChatMemberStatus(
    ctx.chatMember?.new_chat_member,
  );

  const payload = JSON.stringify(ctx.update);

  return {
    timestamp,
    type,
    to,
    from,
    from_bot,
    from_firstname,
    from_lastname,
    from_username,
    from_languagecode,
    from_premium,
    from_type,
    from_title,
    from_businessconnection,
    from_boostcount,
    from_signature,
    to_bot,
    to_firstname,
    to_lastname,
    to_username,
    chat_id,
    chat_username,
    chat_title,
    chat_firstname,
    chat_lastname,
    chat_type,
    message_type,
    message_id,
    message_threadid,
    message_date,
    message_topic,
    message_automaticforward,
    message_effectid,
    message_replytomessageid,
    message_quotetext,
    forward_date,
    forward_from,
    forward_messageid,
    forward_signature,
    forward_bot,
    forward_name,
    message_text,
    message_url,
    dice_emoji,
    dice_value,
    callbackquery_id,
    callbackquery_inlinemessageid,
    callbackquery_data,
    inlinequery_id,
    inlinequery_text,
    inlinequery_offset,
    inlineresultchosen_id,
    inlineresultchosen_query,
    inlineresultchosen_inlinemessageid,
    chatmember_id,
    chatmember_bot,
    chatmember_firstname,
    chatmember_lastname,
    chatmember_username,
    chatmember_premium,
    chatmember_oldstatus,
    chatmember_newstatus,
    payload,
  };
}

function getChatMemberStatus(chatMember: ChatMember | undefined) {
  switch (chatMember?.status) {
    case "creator":
      return ChatMemberStatus.Creator;
    case "administrator":
      return ChatMemberStatus.Administrator;
    case "member":
      return ChatMemberStatus.Member;
    case "restricted":
      return ChatMemberStatus.Restricted;
    case "left":
      return ChatMemberStatus.Left;
    case "kicked":
      return ChatMemberStatus.Banned;
    default:
      return ChatMemberStatus.Unknown;
  }
}
