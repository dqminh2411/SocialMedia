import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react'; // You'll need to install this package
import '../assets/css/PostForm.module.css';

const PostForm = ({ post = null, onSubmit }) => {
    // Using a ref for the editable div instead of a textarea
    const editorRef = useRef(null);
    const savedRangeRef = useRef(null)
    const fileInputRef = useRef(null);
    const linkDialogRef = useRef(null);

    // State for form data
    const [formData, setFormData] = useState({
        content: post?.content || '',
        images: post?.images || [],
        videos: post?.videos || [],
    });

    // State for UI control
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
    const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [hashtagQuery, setHashtagQuery] = useState('');
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkData, setLinkData] = useState({ url: '', text: '' });
    //const [selectionRange, setSelectionRange] = useState(null);

    // Mock data for suggestions
    const mockUsers = [
        { id: 1, username: 'johndoe', fullName: 'John Doe', avatar: 'https://via.placeholder.com/50' },
        { id: 2, username: 'janedoe', fullName: 'Jane Doe', avatar: 'https://via.placeholder.com/50' },
        { id: 3, username: 'bobsmith', fullName: 'Bob Smith', avatar: 'https://via.placeholder.com/50' },
    ];

    const mockHashtags = [
        { id: 1, name: 'photography' },
        { id: 2, name: 'travel' },
        { id: 3, name: 'food' },
        { id: 4, name: 'fashion' },
    ];

    // Filtered suggestions based on queries
    const filteredUsers = mockUsers.filter(user =>
        user.username.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    const filteredHashtags = mockHashtags.filter(tag =>
        tag.name.toLowerCase().includes(hashtagQuery.toLowerCase())
    );

    // Initialize the editor content
    useEffect(() => {
        if (editorRef.current && post?.content) {
            editorRef.current.innerHTML = post.content;
        }
    }, [post]);

    // Save the current selection range when opening link dialog
    // const saveSelection = () => {
    //
    //     const sel = window.getSelection();
    //     if (sel && sel.rangeCount > 0) {
    //         return sel.getRangeAt(0);
    //     }
    //
    //     return null;
    // };
    //
    // // Restore the selection range when inserting a link
    // const restoreSelection = (range) => {
    //     if (range && window.getSelection()) {
    //         const sel = window.getSelection();
    //         sel.removeAllRanges();
    //         sel.addRange(range);
    //     }
    // };


    // save selection range to add emoji
    const saveRange = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
        }
    }
    // Monitor content changes in the editable div
    const handleContentChange = () => {
        if (!editorRef.current) return;

        const content = editorRef.current.innerHTML;
        setFormData(prev => ({ ...prev, content }));

        // Get the current text at cursor position
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(editorRef.current);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const textBeforeCaret = preCaretRange.toString();

            // Check for @ mentions
            const mentionMatch = /@(\w*)$/.exec(textBeforeCaret);
            if (mentionMatch) {
                setMentionQuery(mentionMatch[1]);
                setShowMentionSuggestions(true);
                setShowHashtagSuggestions(false);
            } else {
                setShowMentionSuggestions(false);
            }

            // Check for # hashtags
            const hashtagMatch = /#(\w*)$/.exec(textBeforeCaret);
            if (hashtagMatch) {
                setHashtagQuery(hashtagMatch[1]);
                setShowHashtagSuggestions(true);
                setShowMentionSuggestions(false);
            } else {
                setShowHashtagSuggestions(false);
            }
        }
    };

    const handleContentClick = (e) => {
        saveRange();
        if (e.target.tagName === 'A') {
            e.preventDefault()
            e.stopPropagation()
            window.open(e.target.href, '_blank')
        }

    }

    // Handle emoji selection
    const handleEmojiClick = (emojiObject) => {
        if (!savedRangeRef.current) return;

        const selection = window.getSelection();

        // Now we should have a valid selection range
        const range = savedRangeRef.current;



        // Create a text node with the emoji
        const textNode = document.createTextNode(emojiObject.emoji);

        // Insert the emoji at the cursor position
        range.deleteContents();
        range.insertNode(textNode);

        // Move cursor after the inserted emoji
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);

        selection.removeAllRanges();
        selection.addRange(range);

        // Close emoji picker and update content state
        setShowEmojiPicker(false);
        handleContentChange();

    };

    // Handle mention selection
    const handleMentionSelect = (username) => {
        replaceTextBeforeCursor(/@\w*$/, `<span class="mention">@${username}</span>&nbsp;`);
        setShowMentionSuggestions(false);
    };

    // Handle hashtag selection
    const handleHashtagSelect = (hashtag) => {
        replaceTextBeforeCursor(/#\w*$/, `<span class="hashtag">#${hashtag}</span>&nbsp;`);
        setShowHashtagSuggestions(false);
    };

    // Replace text before cursor with formatted HTML
    const replaceTextBeforeCursor = (regex, html) => {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = savedRangeRef.current;
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        const textBeforeCaret = preCaretRange.toString();
        const lastMatch = textBeforeCaret.match(regex);

        if (!lastMatch) return;

        // Calculate how many characters to delete
        const deleteCount = lastMatch[0].length;
        const tempRange = range.cloneRange();

        // Move the range back by the number of characters to delete
        for (let i = 0; i < deleteCount; i++) {
            tempRange.setStart(range.endContainer, Math.max(0, range.endOffset - 1));
            tempRange.setEnd(range.endContainer, range.endOffset);

            if (tempRange.toString().length > 0) {
                // Delete one character at a time
                tempRange.deleteContents();
            }
        }

        // Insert the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Move all nodes from the temp div to the document
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }

        range.insertNode(fragment);

        // Move cursor to the end of the inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger content change handling
        handleContentChange();
    };

    // Open link dialog with selected text
    const openLinkDialog = () => {
        saveRange();
        const selection = window.getSelection();
        selection.addRange(savedRangeRef.current)
        let selectedText = '';

        if (selection.rangeCount > 0) {
            selectedText = selection.toString();
        }

        setLinkData({ url: '', text: selectedText });
        setShowLinkDialog(true);
    };

    // Insert link to the editor
    const insertLink = () => {
        if (!linkData.url) {
            setShowLinkDialog(false);
            return;
        }

        if (savedRangeRef) {
            // restoreSelection(selectionRange);

            const selection = window.getSelection();
            selection.addRange(savedRangeRef.current)
            if (selection.rangeCount > 0) {
                const range = savedRangeRef.current;
                range.deleteContents();

                const linkText = linkData.text || linkData.url;
                const linkHtml = `<a href="${linkData.url}" class="url" target="_blank">${linkText}</a>`;

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = linkHtml;

                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }

                range.insertNode(fragment);

                // Move cursor to the end
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        setShowLinkDialog(false);
        handleContentChange();
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                // Handle image
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, {
                        id: Date.now() + Math.random(), // Temporary ID
                        file,
                        url: URL.createObjectURL(file),
                    }]
                }));
            } else if (file.type.startsWith('video/')) {
                // Handle video
                setFormData(prev => ({
                    ...prev,
                    videos: [...prev.videos, {
                        id: Date.now() + Math.random(), // Temporary ID
                        file,
                        url: URL.createObjectURL(file),
                    }]
                }));
            }
        });

        // Reset file input
        e.target.value = '';
    };

    // Remove media item
    const removeMedia = (type, id) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item.id !== id)
        }));
    };

    // Handle pasting to strip formatting but keep links
    const handlePaste = (e) => {
        e.preventDefault();

        // Get pasted text
        const text = e.clipboardData.getData('text/plain');

        // Insert text at cursor position
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();

            // Split text by URLs and insert with formatting
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const parts = text.split(urlRegex);

            // Create a document fragment to hold all the nodes
            const fragment = document.createDocumentFragment();

            parts.forEach((part, index) => {
                if (index % 2 === 0) {
                    // Regular text
                    if (part) {
                        fragment.appendChild(document.createTextNode(part));
                    }
                } else {
                    // URL
                    const link = document.createElement('a');
                    link.href = part;
                    link.className = 'url';
                    link.target = '_blank';
                    link.textContent = part;
                    fragment.appendChild(link);
                }
            });

            range.insertNode(fragment);

            // Move cursor to the end
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        handleContentChange();
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Get the content from the editor
        const content = editorRef.current.innerHTML;

        // Process form data
        const processedData = {
            ...formData,
            content,
            // Extract mentions from content by parsing HTML
            mentions: Array.from(editorRef.current.querySelectorAll('.mention'))
                .map(el => el.textContent.slice(1)), // Remove @ symbol
            // Extract hashtags from content by parsing HTML
            hashtags: Array.from(editorRef.current.querySelectorAll('.hashtag'))
                .map(el => el.textContent.slice(1)), // Remove # symbol
        };

        onSubmit(processedData);
    };

    return (
        <div className="post-form-container">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <div className="editor-toolbar">
                        <button
                            type="button"
                            className="toolbar-button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            😊
                        </button>
                        <button
                            type="button"
                            className="toolbar-button"
                            onClick={openLinkDialog}
                        >
                            🔗
                        </button>
                    </div>

                    <div className="rich-editor-container">
                        <div
                            ref={editorRef}
                            className="rich-editor"
                            contentEditable={true}
                            onInput={handleContentChange}
                            onPaste={handlePaste}
                            onClick={handleContentClick}
                            onFocus={saveRange}
                            onKeyUp={saveRange}
                            onMouseUp={saveRange}
                            data-placeholder="What's on your mind?"
                        />

                        {showEmojiPicker && (
                            <div className="emoji-picker-container">
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </div>
                        )}

                        {/* Link dialog */}
                        {showLinkDialog && (
                            <div className="link-dialog" ref={linkDialogRef}>
                                <div className="link-dialog-content">
                                    <h3>Insert Link</h3>
                                    <div className="link-form-group">
                                        <label>URL</label>
                                        <input
                                            type="text"
                                            value={linkData.url}
                                            onChange={(e) => setLinkData(prev => ({ ...prev, url: e.target.value }))}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                    <div className="link-form-group">
                                        <label>Text</label>
                                        <input
                                            type="text"
                                            value={linkData.text}
                                            onChange={(e) => setLinkData(prev => ({ ...prev, text: e.target.value }))}
                                            placeholder="Link text"
                                        />
                                    </div>
                                    <div className="link-dialog-actions">
                                        <button type="button" onClick={() => setShowLinkDialog(false)}>Cancel</button>
                                        <button type="button" onClick={insertLink}>Insert</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mention suggestions */}
                    {showMentionSuggestions && filteredUsers.length > 0 && (
                        <div className="suggestions-container">
                            <ul className="suggestions-list">
                                {filteredUsers.map(user => (
                                    <li
                                        key={user.id}
                                        className="suggestion-item"
                                        onClick={() => handleMentionSelect(user.username)}
                                    >
                                        <img src={user.avatar} alt={user.username} className="suggestion-avatar" />
                                        <div className="suggestion-info">
                                            <span className="suggestion-name">{user.fullName}</span>
                                            <span className="suggestion-username">@{user.username}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Hashtag suggestions */}
                    {showHashtagSuggestions && filteredHashtags.length > 0 && (
                        <div className="suggestions-container">
                            <ul className="suggestions-list">
                                {filteredHashtags.map(tag => (
                                    <li
                                        key={tag.id}
                                        className="suggestion-item"
                                        onClick={() => handleHashtagSelect(tag.name)}
                                    >
                                        <span className="suggestion-hashtag">#{tag.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <div className="media-controls">
                        <button
                            type="button"
                            className="media-button"
                            onClick={() => fileInputRef.current.click()}
                        >
                            Add Photos/Videos
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                            multiple
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Media preview */}
                    {(formData.images.length > 0 || formData.videos.length > 0) && (
                        <div className="media-preview">
                            {/* Images */}
                            {formData.images.length > 0 && (
                                <div className="images-container">
                                    {formData.images.map(image => (
                                        <div key={image.id} className="media-item">
                                            <img src={image.url} alt="Preview" className="media-thumbnail" />
                                            <button
                                                type="button"
                                                className="remove-media"
                                                onClick={() => removeMedia('images', image.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Videos */}
                            {formData.videos.length > 0 && (
                                <div className="videos-container">
                                    {formData.videos.map(video => (
                                        <div key={video.id} className="media-item">
                                            <video src={video.url} className="media-thumbnail" controls />
                                            <button
                                                type="button"
                                                className="remove-media"
                                                onClick={() => removeMedia('videos', video.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        {post ? 'Update Post' : 'Create Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;