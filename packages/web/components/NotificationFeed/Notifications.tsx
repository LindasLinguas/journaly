import React, { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import Link from 'next/link'
import {
  NotificationFragmentFragment as NotificationType,
  AuthorFragmentFragment as UserType,
  NotificationReadStatus,
} from '@/generated/graphql'
import theme from '@/theme'
import ClapIcon from '../Icons/ClapIcon'
import UserList from '../UserList'
import { useTranslation } from '@/config/i18n'
import LikeIcon from '../Icons/LikeIcon'
import UserAvatar from '../UserAvatar'
import MultiuserAvatar from '../MultiuserAvatar'
import Button, { ButtonVariant } from '@/components/Button'
import CheckmarkIcon from '../Icons/CheckmarkIcon'
import DeleteIcon from '../Icons/DeleteIcon'
import { navConstants } from '../Dashboard/Nav'

export type LevelOneNotificationProps = {
  notification: NotificationType
  onNotificationClick: () => void
  onMarkRead: (arg: number) => void
  onDelete: (arg: number) => void
}

export type LevelTwoNotificationProps = {
  notification: NotificationType
}

type ThreadCommentNotificationComment =
  NotificationType['threadCommentNotifications'][number]['comment']

type ThreadGroupedCommentsType = Record<
  number,
  {
    thread: ThreadCommentNotificationComment['thread']
    comments: ThreadCommentNotificationComment[]
  }
>

type ThreadCommentThanksNotificationThanks =
  NotificationType['threadCommentThanksNotifications'][number]['thanks']

type ThreadGroupedThanksType = Record<
  number,
  {
    thread: ThreadCommentThanksNotificationThanks['comment']['thread']
    thanks: ThreadCommentThanksNotificationThanks[]
  }
>

type BaseNotificationLayoutProps = {
  left?: JSX.Element
  middle: JSX.Element
  right?: JSX.Element
  onNotificationClick: () => void
  onMarkRead: () => void
  onDelete: () => void
  readStatus: NotificationReadStatus
}

export const getUserIdentifier = (user: UserType) => user?.name || user.handle

const BaseNotificationLayout: React.FC<BaseNotificationLayoutProps> = ({
  left,
  middle,
  right,
  onNotificationClick,
  onMarkRead,
  onDelete,
  readStatus,
}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (window.innerWidth < navConstants.mobileBreakpoint) {
      setIsMobile(true)
    }
  }, [])
  return (
    <div className="container">
      <div className="left-section" onClick={onNotificationClick}>
        {left}
      </div>
      <div className="middle-section" onClick={onNotificationClick}>
        {middle}
      </div>
      <div className="right-section" onClick={onNotificationClick}>
        {right}
      </div>
      <div className="desktop-actions">
        <Button variant={ButtonVariant.Icon} disabled={readStatus === NotificationReadStatus.Read}>
          <div className="desktop-action-btn read">
            <CheckmarkIcon size={24} color={theme.colors.charcoal} onClick={onMarkRead} />
          </div>
        </Button>
        <Button variant={ButtonVariant.Icon} onClick={onDelete}>
          <div className="desktop-action-btn delete">
            <DeleteIcon color={theme.colors.red} size={24} />
          </div>
        </Button>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          width: 100%;
          padding: 16px;
          border-bottom: 1px solid ${theme.colors.gray600};
          align-items: center;
          min-height: 100px;
          cursor: pointer;
          filter: opacity(${readStatus === NotificationReadStatus.Read ? 0.5 : 1});
        }

        .container:hover {
          background-color: ${theme.colors.gray800};
        }

        .left-section {
          display: ${left ? '' : 'none'};
        }

        .middle-section {
          display: ${middle ? '' : 'none'};
          padding: 0 16px;
          flex: 1;
        }

        .right-section {
          display: ${right ? '' : 'none'};
        }

        .container :global(.right-section > img) {
          width: 80px;
          height: 50px;
          object-fit: cover;
          border-radius: 2px;
          box-shadow: 0px 3px 8px #00000075;
        }

        .container :global(.left-section img) {
          box-shadow: 0px 3px 8px #00000075;
        }

        .desktop-actions {
          margin-left: 16px;
          display: ${isMobile ? 'none' : ''};
        }
      `}</style>
    </div>
  )
}

/**
 * Level One Notifications
 *
 * These are notifications that appear at the top level of the Notification Feed
 */

export const ThreadCommentNotificationLevelOne: React.FC<LevelOneNotificationProps> = ({
  notification,
  onNotificationClick,
  onDelete,
  onMarkRead,
}) => {
  const { t } = useTranslation('notifications')
  const count = notification.threadCommentNotifications.length
  const isPostAuthor = notification.userId === notification.post?.authorId
  const translationKey = isPostAuthor ? 'threadComments' : 'threadCommentsSubscribed'

  return (
    <BaseNotificationLayout
      middle={<p>{t(`levelOne.${translationKey}`, { count })}</p>}
      right={
        <img
          className="post-image"
          src={notification.post?.headlineImage.smallSize}
          alt={`post "${notification.post?.title}"'s image`}
        />
      }
      onNotificationClick={onNotificationClick}
      readStatus={notification.readStatus}
      onDelete={() => onDelete(notification.id)}
      onMarkRead={() => onMarkRead(notification.id)}
    />
  )
}

export const PostClapNotificationLevelOne: React.FC<LevelOneNotificationProps> = ({
  notification,
  onNotificationClick,
  onDelete,
  onMarkRead,
}) => {
  const { t } = useTranslation('notifications')
  const count = notification.postClapNotifications.length

  return (
    <BaseNotificationLayout
      left={<ClapIcon colorScheme="dark-mode" width={24} />}
      middle={<p>{t('levelOne.postClaps', { count })}</p>}
      right={
        <img
          src={notification.post?.headlineImage.smallSize}
          alt={`post "${notification.post?.title}"'s image`}
        />
      }
      onNotificationClick={onNotificationClick}
      readStatus={notification.readStatus}
      onDelete={() => onDelete(notification.id)}
      onMarkRead={() => onMarkRead(notification.id)}
    />
  )
}

export const ThreadCommentThanksNotificationLevelOne: React.FC<LevelOneNotificationProps> = ({
  notification,
  onNotificationClick,
  onDelete,
  onMarkRead,
}) => {
  const { t } = useTranslation('notifications')
  const thanksAuthor = notification.threadCommentThanksNotifications[0].thanks.author
  const count = notification.threadCommentThanksNotifications.length

  return (
    <BaseNotificationLayout
      left={<UserAvatar user={thanksAuthor} size={50} />}
      middle={
        <p>
          {t('levelOne.threadCommentThanks', {
            userIdentifier: getUserIdentifier(thanksAuthor),
            count,
          })}
        </p>
      }
      right={
        <img
          src={notification.post?.headlineImage.smallSize}
          alt={`post "${notification.post?.title}"'s image`}
        />
      }
      onNotificationClick={onNotificationClick}
      readStatus={notification.readStatus}
      onDelete={() => onDelete(notification.id)}
      onMarkRead={() => onMarkRead(notification.id)}
    />
  )
}

export const PostCommentNotificationLevelOne: React.FC<LevelOneNotificationProps> = ({
  notification,
  onNotificationClick,
  onDelete,
  onMarkRead,
}) => {
  const { t } = useTranslation('notifications')
  const count = notification.postCommentNotifications.length
  const isPostAuthor = notification.userId === notification.post?.authorId
  const translationKey = isPostAuthor ? 'postComments' : 'postCommentsSubscribed'

  return (
    <BaseNotificationLayout
      middle={<p>{t(`levelOne.${translationKey}`, { count })}</p>}
      right={
        <img
          src={notification.post?.headlineImage.smallSize}
          alt={`post "${notification.post?.title}"'s image`}
        />
      }
      onNotificationClick={onNotificationClick}
      readStatus={notification.readStatus}
      onDelete={() => onDelete(notification.id)}
      onMarkRead={() => onMarkRead(notification.id)}
    />
  )
}

export const NewPostNotificationLevelOne: React.FC<LevelOneNotificationProps> = ({
  notification,
  onNotificationClick,
  onDelete,
  onMarkRead,
}) => {
  const { t } = useTranslation('notifications')
  const count = notification.newPostNotifications.length

  return (
    <BaseNotificationLayout
      left={
        <MultiuserAvatar
          users={notification.newPostNotifications.map((notification) => notification.post.author)}
        />
      }
      middle={<p>{t('levelOne.newPosts', { count })}</p>}
      onNotificationClick={onNotificationClick}
      readStatus={notification.readStatus}
      onDelete={() => onDelete(notification.id)}
      onMarkRead={() => onMarkRead(notification.id)}
    />
  )
}

export const NewFollowerNotificationLevelOne: React.FC<LevelOneNotificationProps> = ({
  notification,
  onNotificationClick,
  onDelete,
  onMarkRead,
}) => {
  const { t } = useTranslation('notifications')
  const count = notification.newFollowerNotifications.length

  return (
    <BaseNotificationLayout
      left={
        <MultiuserAvatar
          users={notification.newFollowerNotifications.map(
            (notification) => notification.followingUser,
          )}
        />
      }
      middle={<p>{t('levelOne.newFollowers', { count })}</p>}
      onNotificationClick={onNotificationClick}
      readStatus={notification.readStatus}
      onDelete={() => onDelete(notification.id)}
      onMarkRead={() => onMarkRead(notification.id)}
    />
  )
}

/**
 * Level Two Notifications
 *
 * These are notifications that appear once a user clicks on a Level One notification
 * and we transition to Level Two which renders a component specifically designs to show
 * more details
 */

export const ThreadCommentThanksNotificationLevelTwo: React.FC<LevelTwoNotificationProps> = ({
  notification,
}) => {
  const { t } = useTranslation('notifications')
  const thanksAuthor = notification.threadCommentThanksNotifications[0].thanks.author
  const count = notification.threadCommentThanksNotifications.length
  // Separate the different threads
  const threadGroupedThanks: ThreadGroupedThanksType = {}

  for (const { thanks } of notification.threadCommentThanksNotifications) {
    if (threadGroupedThanks[thanks.comment.thread.id]) {
      threadGroupedThanks[thanks.comment.thread.id].thanks.push(thanks)
    } else {
      threadGroupedThanks[thanks.comment.thread.id] = {
        thread: thanks.comment.thread,
        thanks: [thanks],
      }
    }
  }

  return (
    <div className="container">
      <div className="thanks-author">
        <UserAvatar user={thanksAuthor} size={50} />
      </div>
      <p className="title">
        {t('levelTwo.threadCommentThanks', {
          userIdentifier: getUserIdentifier(thanksAuthor),
          count,
        })}
      </p>
      {Object.values(threadGroupedThanks).map(
        ({ thread, thanks }: ThreadGroupedThanksType[number]) => {
          return (
            <div className="thread" key={thread.id}>
              <span className="highlighted-content">{thread.highlightedContent}</span>
              <ul>
                {thanks.map((thanks) => (
                  <li className="comment" key={thanks.id}>
                    <span>
                      <LikeIcon filled={true} />
                    </span>
                    <span className="comment-body-container">
                      <Markdown>{thanks.comment.body}</Markdown>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        },
      )}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          padding: 16px;
          border-bottom: 1px solid ${theme.colors.gray600};
          min-height: 100px;
          gap: 16px;
          color: ${theme.colors.white};
          cursor: pointer;
        }

        .title {
          text-align: center;
          margin-bottom: 16px;
        }

        .highlighted-content {
          text-align: center;
          background-color: ${theme.colors.highlightColor};
          margin-bottom: 12px;
          padding: 4px;
        }

        .thanks-author {
          margin: 0 auto;
        }

        .thread {
          display: flex;
          flex-direction: column;
          margin-bottom: 10px;
        }

        .thread:hover {
          background-color: ${theme.colors.gray800};
        }

        ul {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comment {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .comment-body-container {
        }

        .author-identifier {
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

export const PostClapNotificationLevelTwo: React.FC<LevelTwoNotificationProps> = ({
  notification,
}) => {
  const { t } = useTranslation('notifications')

  const count = notification.postClapNotifications.length
  const clappingUsers = notification.postClapNotifications.map((clap) => clap.postClap.author)

  return (
    <div className="container">
      <p className="clap-count">{t('levelTwo.postClaps', { count })}</p>
      <UserList users={clappingUsers} colorScheme="dark-mode" />
      <style jsx>{`
        .container {
          padding: 0 10px;
        }
        .clap-count {
          text-align: center;
          font-weight: 600;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  )
}

export const ThreadCommentNotificationLevelTwo: React.FC<LevelTwoNotificationProps> = ({
  notification,
}) => {
  // Separate the different threads
  const threadGroupedComments: ThreadGroupedCommentsType = {}

  for (const { comment } of notification.threadCommentNotifications) {
    if (threadGroupedComments[comment.thread.id]) {
      threadGroupedComments[comment.thread.id].comments.push(comment)
    } else {
      threadGroupedComments[comment.thread.id] = {
        thread: comment.thread,
        comments: [comment],
      }
    }
  }

  return (
    <div className="container">
      <p className="post-title">{notification.post?.title}</p>
      {Object.values(threadGroupedComments).map(
        ({ thread, comments }: ThreadGroupedCommentsType[number]) => {
          return (
            <div className="thread" key={thread.id}>
              <span className="highlighted-content">{thread.highlightedContent}</span>
              <ul>
                {comments.map((comment) => (
                  <li key={comment.id}>
                    <Link href={`/post/${notification.post?.id}#t=${thread.id}`}>
                      <a className="comment">
                        <UserAvatar user={comment.author} size={50} />
                        <div className="comment-right-side">
                          <span className="author-identifier">
                            @{getUserIdentifier(comment.author)}
                          </span>
                          <Markdown>{comment.body}</Markdown>
                        </div>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        },
      )}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          padding: 16px;
          border-bottom: 1px solid ${theme.colors.gray600};
          min-height: 100px;
          gap: 16px;
          color: ${theme.colors.white};
        }

        .post-title {
          font-weight: 600;
          font-size: 20px;
          text-align: center;
          margin-bottom: 16px;
        }

        .highlighted-content {
          text-align: center;
          background-color: ${theme.colors.highlightColor};
          margin-bottom: 12px;
          padding: 4px;
        }

        .thread {
          display: flex;
          flex-direction: column;
          margin-bottom: 10px;
        }

        .thread:hover {
          background-color: ${theme.colors.gray800};
        }

        ul {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comment {
          display: flex;
          gap: 12px;
          align-items: center;
          color: ${theme.colors.white};
        }

        .author-identifier {
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

export const PostCommentNotificationLevelTwo: React.FC<LevelTwoNotificationProps> = ({
  notification,
}) => {
  const comments = notification.postCommentNotifications.map(
    (notification) => notification.postComment,
  )

  return (
    <div className="container">
      <p className="post-title">{notification.post?.title}</p>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <Link href={`/post/${notification.post?.id}#pc-${comment.id}`}>
              <a className="comment">
                <UserAvatar user={comment.author} size={50} />
                <div className="comment-right-side">
                  <span className="author-identifier">@{getUserIdentifier(comment.author)}</span>
                  <Markdown>{comment.body}</Markdown>
                </div>
              </a>
            </Link>
          </li>
        ))}
      </ul>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          padding: 16px;
          min-height: 100px;
          gap: 16px;
          color: ${theme.colors.white};
        }

        .post-title {
          font-weight: 600;
          font-size: 20px;
          text-align: center;
          margin-bottom: 16px;
        }

        ul {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comment {
          display: flex;
          gap: 12px;
          align-items: center;
          border-bottom: 1px solid ${theme.colors.gray600};
          padding-bottom: 16px;
          color: ${theme.colors.white};
        }

        .comment:hover {
          background-color: ${theme.colors.gray800};
        }

        .author-identifier {
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

export const NewPostNotificationLevelTwo: React.FC<LevelTwoNotificationProps> = ({
  notification,
}) => {
  const { t } = useTranslation('notifications')

  const newPosts = notification.newPostNotifications.map((notification) => notification.post)

  return (
    <div className="container">
      <p className="title">{t('levelTwo.newPosts')}</p>
      {newPosts.map((post) => (
        <div className="post-container" onClick={() => {}}>
          <div className="left-section">
            <UserAvatar user={post.author} size={50} />
          </div>
          <div className="middle-section">
            <div>
              <p className="post-title">{post.title}</p>
              <p className="post-author">
                by <span className="user-identifier">{getUserIdentifier(post.author)}</span>
              </p>
            </div>
          </div>
          <div className="right-section">
            <img src={post.headlineImage.smallSize} />
          </div>
        </div>
      ))}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .post-container {
          display: flex;
          width: 100%;
          padding: 16px;
          border-bottom: 1px solid ${theme.colors.gray600};
          align-items: center;
          min-height: 100px;
          cursor: pointer;
        }

        .post-container:hover {
          background-color: ${theme.colors.gray800};
        }

        .middle-section {
          padding: 0 16px;
          flex: 1;
        }

        .title,
        .post-title {
          font-weight: 600;
        }

        .title {
          font-size: 20px;
          text-align: center;
          margin-bottom: 16px;
        }

        .post-author {
          font-size: 12px;
        }

        .user-identifier {
          font-weight: 600;
        }

        .right-section > img {
          width: 80px;
          height: 50px;
          object-fit: cover;
          border-radius: 2px;
          box-shadow: 0px 3px 8px #00000075;
        }

        .container :global(.left-section img) {
          box-shadow: 0px 3px 8px #00000075;
        }
      `}</style>
    </div>
  )
}

export const NewFollowerNotificationLevelTwo: React.FC<LevelTwoNotificationProps> = ({
  notification,
}) => {
  const { t } = useTranslation('notifications')

  const count = notification.newFollowerNotifications.length
  const newFollowers = notification.newFollowerNotifications.map(
    (notification) => notification.followingUser,
  )

  return (
    <div className="container">
      <p className="title">{t('levelTwo.newFollowers', { count })}</p>
      <UserList users={newFollowers} colorScheme="dark-mode" />
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          padding: 16px;
          border-bottom: 1px solid ${theme.colors.gray600};
          min-height: 100px;
          gap: 16px;
          color: ${theme.colors.white};
        }

        .title {
          text-align: center;
          margin-bottom: 16px;
        }

        .highlighted-content {
          text-align: center;
          background-color: ${theme.colors.highlightColor};
          margin-bottom: 8px;
        }

        .thread {
          display: flex;
          flex-direction: column;
        }
        .comment {
          display: flex;
        }
      `}</style>
    </div>
  )
}
