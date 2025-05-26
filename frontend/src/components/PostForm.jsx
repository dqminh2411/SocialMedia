import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react'; // You'll need to install this package
import styles from '../assets/css/PostForm.module.css';
import postService from '../services/post.service';
import authService from '../services/auth.service';

const PostForm = ({ post = null, onSubmit }) => {
    // Using a ref for the editable div instead of a textarea
    const editorRef = useRef(null);
    const savedRangeRef = useRef(null)
    const fileInputRef = useRef(null);
    const linkDialogRef = useRef(null);

    // State for current image in slideshow
    const [currentImageIndex, setCurrentImageIndex] = useState(0);    // State for form data
    const [formData, setFormData] = useState({
        content: post?.content || '',
        images: post?.images || [],
        videos: post?.videos || [],
    });

    // State for UI control
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    /* Temporarily disabled mention and hashtag features
    const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
    const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [hashtagQuery, setHashtagQuery] = useState('');
    */
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkData, setLinkData] = useState({ url: '', text: '' });

    // Mock data for suggestions - commented out temporarily
    /*
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
    */// Initialize the editor content
    useEffect(() => {
        if (editorRef.current && post?.content) {
            editorRef.current.innerHTML = post.content;
            // Set initial state
            setFormData(prev => ({ ...prev, content: post.content }));
        }
    }, [post]);

    // Function to fetch user suggestions (in a real app, this would be an API call)
    const fetchUserSuggestions = (query) => {
        // Simulate API delay
        setTimeout(() => {
            // Filter users based on query
            const filtered = mockUsers.filter(user =>
                user.username.toLowerCase().includes(query.toLowerCase()) ||
                user.fullName.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredUsers(filtered);
        }, 100);
    };

    // Function to fetch hashtag suggestions (in a real app, this would be an API call)
    const fetchHashtagSuggestions = (query) => {
        // Simulate API delay
        setTimeout(() => {
            // Filter hashtags based on query
            const filtered = mockHashtags.filter(tag =>
                tag.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredHashtags(filtered);
        }, 100);
    };

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
    }    // Monitor content changes in the editable div
    const handleContentChange = () => {
        if (!editorRef.current) return;

        const content = editorRef.current.innerHTML;
        setFormData(prev => {
            // Only update if content has actually changed to avoid unnecessary re-renders
            if (prev.content !== content) {
                return { ...prev, content };
            }
            return prev;
        });

        /* Temporarily disabled mention and hashtag features
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
                const query = mentionMatch[1];
                setMentionQuery(query);
                setShowMentionSuggestions(true);
                setShowHashtagSuggestions(false);
                // Fetch user suggestions
                fetchUserSuggestions(query);
            } else {
                setShowMentionSuggestions(false);
            }

            // Check for # hashtags
            const hashtagMatch = /#(\w*)$/.exec(textBeforeCaret);
            if (hashtagMatch) {
                const query = hashtagMatch[1];
                setHashtagQuery(query);
                setShowHashtagSuggestions(true);
                setShowMentionSuggestions(false);
                // Fetch hashtag suggestions
                fetchHashtagSuggestions(query);
            } else {
                setShowHashtagSuggestions(false);
            }
        }
        */

        // Save the range after any content change
        saveRange();
    };

    const handleContentClick = (e) => {
        saveRange();
        if (e.target.tagName === 'A') {
            e.preventDefault()
            e.stopPropagation()
            window.open(e.target.href, '_blank')
        }

    }

    // Function to insert text at cursor position
    const insertTextAtCursor = (text) => {
        if (!editorRef.current) return;

        // Focus the editor
        editorRef.current.focus();

        // Get current selection
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            // Get the range
            const range = selection.getRangeAt(0);

            // Delete any selected text
            range.deleteContents();

            // Insert the text
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);

            // Move cursor to the end of the inserted text
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);

            // Trigger content change to update suggestions
            handleContentChange();

            // Save the range for further operations
            saveRange();
        }
    };

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
    };    // Handle mention selection - temporarily commented out
    /*
    const handleMentionSelect = (username) => {
        if (!savedRangeRef.current) return;
        
        // Focus the editor if it's not already focused
        editorRef.current.focus();
        
        // Insert mention with proper structure and a space after it
        replaceTextBeforeCursor(/@\w*$/, `<span class="${styles.mention}">@${username}</span>&nbsp;`);
        setShowMentionSuggestions(false);
        
        // Ensure the editor keeps focus
        editorRef.current.focus();
    };

    // Handle hashtag selection - temporarily commented out
    const handleHashtagSelect = (hashtag) => {
        if (!savedRangeRef.current) return;

        // Focus the editor if it's not already focused
        editorRef.current.focus();

        // Insert hashtag with proper structure
        replaceTextBeforeCursor(/#\w*$/, `<span class="${styles.hashtag}">#${hashtag}</span>`);
        setShowHashtagSuggestions(false);

        // Ensure the editor keeps focus
        editorRef.current.focus();
    };
    */// Replace text before cursor with formatted HTML
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

        // Move the range back to the end of the last match
        tempRange.setStart(range.endContainer, range.endOffset - deleteCount);
        tempRange.setEnd(range.endContainer, range.endOffset);

        // Delete the last match
        tempRange.deleteContents();

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
                const range = savedRangeRef.current; range.deleteContents();

                const linkText = linkData.text || linkData.url;
                const linkHtml = `<a href="${linkData.url}" class="${styles.url}" target="_blank">${linkText}</a>`;

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
                    // URL                    const link = document.createElement('a');
                    link.href = part;
                    link.className = styles.url;
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
    };    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Get the content from the editor
        const content = editorRef.current.innerHTML;

        // Validate content
        if (!content.trim()) {
            setError("Post content cannot be empty");
            return;
        }

        // Reset states
        setError(null);
        setIsSubmitting(true);
        setSuccess(false);

        // Get the current user
        const currentUser = authService.getCurrentUser();

        if (!currentUser || !currentUser.user) {
            setError('User not authenticated');
            setIsSubmitting(false);
            return;
        }

        // Extract media files from formData for API call
        const mediaFiles = [
            ...formData.images.map(img => img.file),
            ...formData.videos.map(video => video.file)
        ];

        // Extract mentions and hashtags from content if needed
        // Here we could implement extraction logic if needed
        const mentions = [];
        const hashtags = [];

        // Prepare data for API
        const postData = {
            creatorId: currentUser.user.id,
            content: content,
            mentions: mentions,
            hashtags: hashtags
        };

        if (post) {
            // Update existing post
            postService.updatePost(post.id, postData, mediaFiles)
                .then(response => {
                    console.log('Post updated successfully:', response);
                    setSuccess(true);
                    setIsSubmitting(false);
                    if (onSubmit) onSubmit(response);
                })
                .catch(error => {
                    console.error('Error updating post:', error);
                    setError('Failed to update post. Please try again.');
                    setIsSubmitting(false);
                });
        } else {
            // Create new post
            postService.createPost(postData, mediaFiles)
                .then(response => {
                    console.log('Post created successfully:', response);
                    setSuccess(true);
                    setIsSubmitting(false);

                    if (onSubmit) onSubmit(response);

                    // Clear form after successful submission
                    editorRef.current.innerHTML = '';
                    setFormData({
                        content: '',
                        images: [],
                        videos: []
                    });
                })
                .catch(error => {
                    console.error('Error creating post:', error);
                    setError('Failed to create post. Please try again.');
                    setIsSubmitting(false);
                });
        }
    };

    return (
        <div className={styles['post-form-container']}>
            <form onSubmit={handleSubmit}>
                <div className={styles['form-group']}>                    {/* Media controls and preview moved above the editor */}
                    <div className={styles['media-controls']}>
                        <button
                            type="button"
                            className={styles['media-button']}
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

                    {/* Media preview as slideshow */}
                    {(formData.images.length > 0 || formData.videos.length > 0) && (
                        <div className={styles['slideshow-container']}>
                            {/* Images slideshow */}
                            {formData.images.length > 0 && (
                                <div className={styles['slideshow']}>
                                    <div className={styles['slide']}>
                                        <img
                                            src={formData.images[currentImageIndex].url}
                                            alt="Preview"
                                            className={styles['slide-media']}
                                        />
                                        <button
                                            type="button"
                                            className={styles['remove-media']}
                                            onClick={() => removeMedia('images', formData.images[currentImageIndex].id)}
                                        >
                                            ×
                                        </button>
                                    </div>                                    {/* Navigation arrows */}
                                    {formData.images.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                className={`${styles['nav-button']} ${styles['prev']}`}
                                                onClick={() => setCurrentImageIndex(prev =>
                                                    prev === 0 ? formData.images.length - 1 : prev - 1
                                                )}
                                            >
                                                ❮
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles['nav-button']} ${styles['next']}`}
                                                onClick={() => setCurrentImageIndex(prev =>
                                                    prev === formData.images.length - 1 ? 0 : prev + 1
                                                )}
                                            >
                                                ❯
                                            </button>                                            {/* Dots/indicators */}
                                            <div className={styles['dots-container']}>
                                                {formData.images.map((_, index) => (
                                                    <button
                                                        type="button"
                                                        key={index}
                                                        className={`${styles.dot} ${index === currentImageIndex ? styles.active : ''}`}
                                                        onClick={() => setCurrentImageIndex(index)}
                                                    ></button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Videos */}
                            {formData.videos.length > 0 && formData.images.length === 0 && (
                                <div className={styles['videos-container']}>
                                    {formData.videos.map(video => (
                                        <div key={video.id} className={styles['media-item']}>
                                            <video src={video.url} className={styles['media-thumbnail']} controls />
                                            <button
                                                type="button"
                                                className={styles['remove-media']}
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

                    <div className={styles['editor-toolbar']}>
                        <button
                            type="button"
                            className={styles['toolbar-button']}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            title="Insert Emoji"
                            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                        >
                            😀
                        </button>
                        <button
                            type="button"
                            className={styles['toolbar-button']}
                            onClick={openLinkDialog}
                            title="Insert Link"
                            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                        >
                            🔗
                        </button>
                        {/* Temporarily disabled mention and hashtag buttons 
                        <button
                            type="button"
                            className={styles['toolbar-button']}
                            onClick={() => {
                                // Insert @ at cursor position and trigger mention suggestions
                                insertTextAtCursor('@');
                            }}
                            title="Mention Someone"
                            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                        >
                            @
                        </button>
                        <button
                            type="button"
                            className={styles['toolbar-button']}
                            onClick={() => {
                                // Insert # at cursor position and trigger hashtag suggestions
                                insertTextAtCursor('#');
                            }}
                            title="Add Hashtag"
                            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                        >
                            #
                        </button>
                        */}
                    </div>
                    <div className={styles['rich-editor-container']}>                        <div
                        ref={editorRef}
                        className={styles['rich-editor']}
                        contentEditable
                        data-placeholder="What's on your mind?"
                        onInput={handleContentChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        onPaste={handlePaste}
                        onClick={handleContentClick}
                    />
                        {showEmojiPicker && (
                            <div className={styles['emoji-picker-container']}>
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </div>
                        )}

                        {showLinkDialog && (
                            <div className={styles['link-dialog']} ref={linkDialogRef}>
                                <div className={styles['link-dialog-content']}>
                                    <h3>Insert Link</h3>
                                    <div className={styles['link-form-group']}>
                                        <label htmlFor="linkUrl">URL:</label>
                                        <input
                                            type="url"
                                            id="linkUrl"
                                            value={linkData.url}
                                            onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles['link-form-group']}>
                                        <label htmlFor="linkText">Text to display:</label>
                                        <input
                                            type="text"
                                            id="linkText"
                                            value={linkData.text}
                                            onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles['link-dialog-actions']}>
                                        <button type="button" onClick={() => setShowLinkDialog(false)}>
                                            Cancel
                                        </button>
                                        <button type="button" onClick={insertLink}>
                                            Insert
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}                        {/* Temporarily disabled mention suggestions UI
                        {showMentionSuggestions && (
                            <div className={styles['suggestions-container']}>
                                <div className={styles['suggestions-header']}>
                                    <strong>Mention a user</strong>
                                    <button
                                        onClick={() => setShowMentionSuggestions(false)}
                                        className={styles['close-suggestions']}
                                    >
                                        ×
                                    </button>
                                </div>
                                {filteredUsers.length > 0 ? (
                                    <ul className={styles['suggestions-list']}>
                                        {filteredUsers.map(user => (
                                            <li
                                                key={user.id}
                                                className={styles['suggestion-item']}
                                                onClick={() => handleMentionSelect(user.username)}
                                            >
                                                <img src={user.avatar} alt={user.username} className={styles['suggestion-avatar']} />
                                                <div className={styles['suggestion-info']}>
                                                    <span className={styles['suggestion-name']}>{user.fullName}</span>
                                                    <span className={styles['suggestion-username']}>@{user.username}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className={styles['no-suggestions']}>
                                        No users found. Keep typing...
                                    </div>
                                )}
                            </div>
                        )}
                        */}

                        {/* Temporarily disabled hashtag suggestions UI
                        {showHashtagSuggestions && (
                            <div className={styles['suggestions-container']}>
                                <div className={styles['suggestions-header']}>
                                    <strong>Select a hashtag</strong>
                                    <button
                                        onClick={() => setShowHashtagSuggestions(false)}
                                        className={styles['close-suggestions']}
                                    >
                                        ×
                                    </button>
                                </div>
                                {filteredHashtags.length > 0 ? (
                                    <ul className={styles['suggestions-list']}>
                                        {filteredHashtags.map(tag => (
                                            <li
                                                key={tag.id}
                                                className={styles['suggestion-item']}
                                                onClick={() => handleHashtagSelect(tag.name)}
                                            >
                                                <span className={styles['suggestion-hashtag']}>#{tag.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className={styles['no-suggestions']}>
                                        <p>No hashtags found. Keep typing...</p>
                                        <button
                                            className={styles['create-hashtag']}
                                            onClick={() => {
                                                // Create a new hashtag with the current query
                                                if (hashtagQuery) {
                                                    handleHashtagSelect(hashtagQuery);
                                                }
                                            }}
                                        >
                                            Create #{hashtagQuery}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        */}                    </div>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    {success && <div className={styles.successMessage}>
                        {post ? 'Post updated successfully!' : 'Post created successfully!'}
                    </div>}
                    <div className={styles['form-actions']}>
                        <button
                            type="submit"
                            className={styles['submit-button']}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : post ? 'Update Post' : 'Create Post'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PostForm;