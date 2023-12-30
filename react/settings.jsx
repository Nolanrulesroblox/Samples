import { useState } from 'react';
import './index.css'
import Switch from "react-switch";
import { useUserAuth } from '../auth/auth';
import AuthModal from '../auth/login';
import ReportWindow from '../report';
export const localStorageTemplate = {
    darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
    nsfw: false,
    blurNsfw: true,
    lowBandwidth: false,
    preloading: false,
    language: "en",
    collectionColors: true,
    notifications: {
        newPosts: false,
        followRequests: false,
        trendingTopics: false,
        directMessages: false,
        commentsAndLikes: false,
        announcements: false,
        all: false,
    },
}
export default function SettingsWindow(params) {
    const webUser = useUserAuth()
    const localStorage = window.localStorage.getItem('local__install__settings')
    const storedSettings = localStorage ? JSON.parse(localStorage) : {};

    // Merge the stored settings with the default template to ensure any missing properties are set to their default values
    const updatedSettings = {
        ...localStorageTemplate,
        ...storedSettings
    };

    const [settings, setSettings] = useState(updatedSettings);
    const [loginModal,setLoginModal] = useState(false)
    const closeLoginModal = (e) =>{
        setLoginModal(false)
    }
    const update = (which) => {
        const tmp = {}
        if (which === "blurNsfw") {
            tmp["blurNsfw"] = !settings[which]
            if (!settings[which] === false) {
                tmp["nsfw"] = false
            }
        }else{
            tmp[which] = !settings[which]
        }
        setSettings({ ...settings, ...tmp })
        window.localStorage.setItem("local__install__settings", JSON.stringify({ ...settings, ...tmp }))
    }
    const updateNotifications = (which) => {
        const tmp = { ...settings.notifications };
        tmp[which] = !settings.notifications[which];
        const newSettings = { ...settings, notifications: tmp };
        setSettings(newSettings);
        window.localStorage.setItem("local__install__settings", JSON.stringify(newSettings));
    };
    const logOut = () =>{
        //logout does not work
        if (webUser) {
            window.logOut()
        }
    }
    return (
        <div className='settings-page'>
            <div className='settings-head'>
                <h2>Appearance</h2>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Dark mode</div>
                        <div className='settings-text-desc'>A dark-themed appearance for low light conditions.</div>
                    </div>
                    <div className='settings-toggle'>
                        <Switch
                            onColor="#1696e1"
                            offColor="#b5b5b5"
                            //onHandleColor="#2693e6"
                            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                            //activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                            height={16}
                            width={32}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            onChange={(e) => {
                                if (e === true) {
                                    document.querySelector('body').classList.add('nrrinc-dark')
                                    document.querySelector('body').classList.remove('nrrinc-light')
                                }else{
                                    document.querySelector('body').classList.add('nrrinc-light')
                                    document.querySelector('body').classList.remove('nrrinc-dark')
                                }
                                update('darkMode');
                                

                            }}
                            checked={settings.darkMode}
                        />
                    </div>
                </label>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Custom Collection Colors</div>
                        <div className='settings-text-desc'>Allow collections to set their own colors.</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        //onHandleColor="#2693e6"
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        //activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { update('collectionColors') }}
                        checked={settings.collectionColors}
                    /></div>
                </label>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>NSFW Blur</div>
                        <div className='settings-text-desc'>Blurs explicit content, but does not remove explicit content</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        //onHandleColor="#2693e6"
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        //activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { update('blurNsfw') }}
                        checked={settings.blurNsfw}
                    /></div>
                </label>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>NSFW mode</div>
                        <div className='settings-text-desc'>Blocks explicit content.</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        //onHandleColor="#2693e6"
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        //activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { update('nsfw') }}
                        checked={settings.nsfw}
                        disabled={!settings.blurNsfw}
                        
                    /></div>
                </label>
            </div>
            <div className='settings-head'>
                <h2>Install</h2>
                <div className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Install app</div>
                        <div className='settings-text-desc'>Enabling it adds the app to your home screen, allowing offline use and notifications.</div>
                    </div>
                    <div className='settings-toggle'><button>Install</button></div>
                </div>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Low bandwidth</div>
                        <div className='settings-text-desc'>Optimizes data usage, conserving your data plan.</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        //onHandleColor="#2693e6"
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        //activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { update('lowBandwidth') }}
                        checked={settings.lowBandwidth}
                    /></div>
                </label>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Fast loading</div>
                        <div className='settings-text-desc'>Speeds up content display in the app, reducing loading times.</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        //onHandleColor="#2693e6"
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        //activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { update('preloading') }}
                        checked={settings.preloading}
                    /></div>
                </label>
            </div>
            <div className='settings-head'>
                <h2>Account</h2>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Login/logout</div>
                        <div className='settings-text-desc'>Used to sign in or out of the app to personalize your settings.</div>
                    </div>
                    <div className='settings-toggle'>
                        {webUser.id === false && (<button onClick={()=>{setLoginModal(true)}}>Login</button>)}
                        {webUser.id !== false && (<button onClick={()=>{logOut()}}>Logout</button>)}
                    </div>
                </label>
                {webUser.id !== false && (
                    <label className='setting-option'>
                        <div className='settings-text'>
                            <div className='settings-text-title'>Account settings</div>
                            <div className='settings-text-desc'>Change account settings, passwords, profile picture etc.</div>
                        </div>
                        <div className='settings-toggle'>
                            <button onClick={() => {
                                console.log('going to user settings')
                            }}>Go</button>
                        </div>
                    </label>
                )}

                <div className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Language</div>
                        <div className='settings-text-desc'>Allows you to select your preferred language for the app.</div>
                    </div>
                    <div className='settings-toggle'>
                        <select defaultValue={'en'}>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>
            </div>
            {loginModal && <AuthModal setter={closeLoginModal}/>}
            <div className='settings-head'>
                <h2>Notifications</h2>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>All notifications</div>
                        <div className='settings-text-desc'>Receive any notifications in this browser.</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { updateNotifications('all') }}
                        checked={settings.notifications.all}
                    /></div>
                </label>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>New Posts</div>
                        <div className='settings-text-desc'>Receive notifications when new posts are shared by users you follow or topics you're interested in.</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { updateNotifications('newPosts') }}
                        checked={settings.notifications.newPosts}
                        disabled={!settings.notifications.all}
                    /></div>
                </label>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Follow Requests</div>
                        <div className='settings-text-desc'>Get notified when someone sends you a follow request or when your follow request is accepted.</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { updateNotifications('followRequests') }}
                        checked={settings.notifications.followRequests}
                        disabled={!settings.notifications.all}
                    /></div>
                </label>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Trending Topics</div>
                        <div className='settings-text-desc'>Receive notifications about trending topics and hashtags on the platform.</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { updateNotifications('trendingTopics') }}
                        checked={settings.notifications.trendingTopics}
                        disabled={!settings.notifications.all}
                    /></div>
                </label>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Direct Messages</div>
                        <div className='settings-text-desc'>Get notified when you receive new direct messages or message requests.</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { updateNotifications('directMessages') }}
                        checked={settings.notifications.directMessages}
                        disabled={!settings.notifications.all}
                    /></div>
                </label>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Comments and Likes</div>
                        <div className='settings-text-desc'>Receive notifications when someone likes your posts or comments on your content.</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { updateNotifications('commentsAndLikes') }}
                        checked={settings.notifications.commentsAndLikes}
                        disabled={!settings.notifications.all}
                    /></div>
                </label>
                <label className='setting-option'>
                    <div className='settings-text'>
                        <div className='settings-text-title'>Announcements</div>
                        <div className='settings-text-desc'>Receive platform announcements and updates in your notifications.</div>
                    </div>
                    <div className='settings-toggle'><Switch
                        onColor="#1696e1"
                        offColor="#b5b5b5"
                        height={16}
                        width={32}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onChange={() => { updateNotifications('announcements') }}
                        checked={settings.notifications.announcements}
                        disabled={!settings.notifications.all}
                    /></div>
                </label>
            </div>
        </div >
    )
}
