import { FormEvent, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { UserLayoutContext } from "../components/UserAppLayout";
import { ApiError, changeUserPassword, updateUserProfile } from "../lib/api";
import { getStorageMode } from "../lib/auth";
import { formatPhone } from "../lib/format";

export function ProfilePage() {
  const { session, profile, updateProfile, signOut } = useOutletContext<UserLayoutContext>();
  const [nickname, setNickname] = useState(profile.nickname || "");
  const [avatar, setAvatar] = useState(profile.avatar || "");
  const [gender, setGender] = useState(profile.gender || "unknown");
  const [bio, setBio] = useState(profile.bio || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  useEffect(() => {
    setNickname(profile.nickname || "");
    setAvatar(profile.avatar || "");
    setGender(profile.gender || "unknown");
    setBio(profile.bio || "");
    setPhone(profile.phone || "");
  }, [profile]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileBusy(true);
    setProfileMessage("");

    try {
      const nextProfile = await updateUserProfile(session.token, {
        nickname: nickname || null,
        avatar: avatar || null,
        gender: gender || null,
        bio: bio || null,
        phone: phone || null,
      });

      updateProfile(nextProfile);
      setProfileMessage("Profile updated successfully.");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        signOut();
        return;
      }

      setProfileMessage(
        requestError instanceof Error ? requestError.message : "Unable to update profile.",
      );
    } finally {
      setProfileBusy(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("The new passwords do not match.");
      return;
    }

    setPasswordBusy(true);
    setPasswordMessage("");

    try {
      await changeUserPassword(session.token, oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password updated successfully.");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        signOut();
        return;
      }

      setPasswordMessage(
        requestError instanceof Error ? requestError.message : "Unable to update password.",
      );
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="profile-grid">
        <article className="surface-panel profile-preview">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current card</p>
              <h3>Profile overview</h3>
            </div>
          </div>

          <div className="profile-preview__card">
            <img
              src={avatar || profile.avatar || "https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"}
              alt={profile.username}
            />
            <div>
              <strong>{nickname || profile.username}</strong>
              <span>@{profile.username}</span>
              <p>{bio || "No bio set yet."}</p>
            </div>
          </div>

          <dl className="detail-list">
            <div>
              <dt>Phone</dt>
              <dd>{formatPhone(phone || profile.phone)}</dd>
            </div>
            <div>
              <dt>Gender</dt>
              <dd>{gender || "unknown"}</dd>
            </div>
            <div>
              <dt>Storage mode</dt>
              <dd>{getStorageMode("user") || "sessionStorage"}</dd>
            </div>
          </dl>
        </article>

        <article className="surface-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Editable fields</p>
              <h3>Profile settings</h3>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleProfileSubmit}>
            <label className="field">
              <span className="field-label">Nickname</span>
              <div className="input-shell">
                <input value={nickname} onChange={(event) => setNickname(event.target.value)} />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Avatar URL</span>
              <div className="input-shell">
                <input value={avatar} onChange={(event) => setAvatar(event.target.value)} />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Phone</span>
              <div className="input-shell">
                <input value={phone} onChange={(event) => setPhone(event.target.value)} />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Gender</span>
              <div className="input-shell">
                <select value={gender} onChange={(event) => setGender(event.target.value)}>
                  <option value="male">male</option>
                  <option value="female">female</option>
                  <option value="unknown">unknown</option>
                </select>
              </div>
            </label>

            <label className="field field--full">
              <span className="field-label">Bio</span>
              <div className="textarea-shell">
                <textarea value={bio} rows={5} onChange={(event) => setBio(event.target.value)} />
              </div>
            </label>

            {profileMessage ? <div className="form-feedback field--full">{profileMessage}</div> : null}

            <button type="submit" className="primary-button field--full" disabled={profileBusy}>
              {profileBusy ? "Saving..." : "Save profile"}
            </button>
          </form>
        </article>
      </section>

      <section className="surface-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Security</p>
            <h3>Change password</h3>
          </div>
        </div>

        <form className="form-grid form-grid--compact" onSubmit={handlePasswordSubmit}>
          <label className="field">
            <span className="field-label">Old password</span>
            <div className="input-shell">
              <input
                type="password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
              />
            </div>
          </label>
          <label className="field">
            <span className="field-label">New password</span>
            <div className="input-shell">
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
          </label>
          <label className="field">
            <span className="field-label">Confirm new password</span>
            <div className="input-shell">
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </label>

          {passwordMessage ? <div className="form-feedback field--full">{passwordMessage}</div> : null}

          <button type="submit" className="primary-button field--full" disabled={passwordBusy}>
            {passwordBusy ? "Updating..." : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
