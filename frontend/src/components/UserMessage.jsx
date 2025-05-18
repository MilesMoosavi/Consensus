import React from "react";

const UserMessage = ({ content, renderFormattedContent }) => {
  return (
    <>
      <div className="user-avatar">👤</div>
      <div className="message-content">
        <div
          dangerouslySetInnerHTML={{
            __html: renderFormattedContent(content),
          }}
        />
      </div>
    </>
  );
};

export default UserMessage;