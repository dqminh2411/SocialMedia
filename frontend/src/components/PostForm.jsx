import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react'; // You'll need to install this package
import styles from '../assets/css/PostForm.module.css';
import postService from '../services/post.service';
import authService from '../services/auth.service';
import { set } from 'date-fns';

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

    const [showHashtagDialog, setShowHashtagDialog] = useState(false);
    const [hashtagSearch, setHashtagSearch] = useState('');
    const [hashtagSearchResults, setHashtagSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);

    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkData, setLinkData] = useState({ url: '', text: '' });

    /// Initialize the editor content and media when editing a post
    useEffect(() => {
        if (post) {
            // Set content
            if (editorRef.current && post.content) {
                editorRef.current.innerHTML = post.content;
                setFormData(prev => ({ ...prev, content: post.content }));
            }            // Set images/videos from post media
            if (post.media && post.media.length > 0) {
                const POST_MEDIA_URL = 'http://localhost:8080/storage/posts/';
                const images = [];
                const videos = [];

                post.media.forEach(media => {
                    if (!media.fileName) {
                        console.error('Missing fileName in media object:', media);
                        return; // Skip this media item
                    }

                    const isVideo = media.fileName.match(/\.(mp4|webm|ogg)$/i);
                    const mediaItem = {
                        id: media.id || `existing-${Math.random().toString(36).substr(2, 9)}`,
                        fileName: media.fileName,
                        url: POST_MEDIA_URL + media.fileName,
                        // For existing media, we don't have a file object
                        isExisting: true
                    };

                    if (isVideo) {
                        videos.push(mediaItem);
                    } else {
                        images.push(mediaItem);
                    }
                });

                setFormData(prev => ({
                    ...prev,
                    images,
                    videos
                }));
            }
        }
    }, [post]);


    // Function to search for hashtags
    const searchHashtags = async (query) => {
        if (!query.trim()) {
            return;
        }
        setSearching(true);
        setSearched(true);
        try {
            const response = await postService.searchHashtags(query);
            setHashtagSearchResults(response.hashtags || []);
            setSearching(false);
        } catch (error) {
            console.error('Error searching hashtags:', error);
        }

    };

    // Function to insert a hashtag into the editor as a link
    const insertHashtag = (hashtag) => {
        if (!savedRangeRef.current) return;

        // Focus the editor if it's not already focused
        editorRef.current.focus();

        // Restore the selection
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);

        // Create the hashtag link HTML
        const hashtagLink = `<a href="/hashtag/${hashtag}" class="${styles.hashtag}">#${hashtag}</a>&nbsp;`;

        // Insert the hashtag at the cursor position
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = hashtagLink;

        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }

        range.insertNode(fragment);

        // Move cursor to the end of the inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        // Close the hashtag dialog
        setShowHashtagDialog(false);

        // Update content
        handleContentChange();
    };




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
    };    // Remove media item
    const removeMedia = (type, id) => {
        // Find the index of the item to be removed
        const indexToRemove = formData[type].findIndex(item => item.id === id);
        if (indexToRemove === -1) return; // Item not found

        // Check if this is an existing media from the backend
        const isExistingMedia = formData[type][indexToRemove].isExisting;

        // First, get the updated items by filtering out the removed item
        setFormData(prev => {
            const updatedItems = prev[type].filter(item => item.id !== id);

            // If we're removing an image, handle the currentImageIndex update
            if (type === 'images') {
                // If removing the currently displayed image
                if (indexToRemove === currentImageIndex) {
                    // If it's the last image, go to the previous one
                    if (indexToRemove === prev[type].length - 1 && indexToRemove > 0) {
                        setCurrentImageIndex(indexToRemove - 1);
                    }
                    // If it's not the last image, keep the same index (will show next image)
                    // Don't need to update if it's the first and only image (will go to 0 anyway)
                }
                // If removing an image before the current one, shift index down
                else if (indexToRemove < currentImageIndex) {
                    setCurrentImageIndex(currentImageIndex - 1);
                }

                // Safety check - ensure index is valid
                if (updatedItems.length === 0) {
                    setCurrentImageIndex(0);
                } else if (currentImageIndex >= updatedItems.length) {
                    setCurrentImageIndex(updatedItems.length - 1);
                }
            } return {
                ...prev,
                [type]: updatedItems
            };
        });

        // If the media being removed is an existing one from the backend, add it to the list to be deleted
        if (post && formData[type][indexToRemove] && formData[type][indexToRemove].isExisting) {
            // Store this in component state to send to backend on submit
            const fileNameToDelete = formData[type][indexToRemove].fileName;
            console.log(`Marked existing media for deletion: ${fileNameToDelete}`);
        }
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
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.images.length === 0 && formData.videos.length === 0) {
            alert("You must add at least one image or video");
            return;
        }

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
        }        // Extract media files from formData for API call
        const mediaFiles = [
            ...formData.images.filter(img => !img.isExisting).map(img => img.file),
            ...formData.videos.filter(video => !video.isExisting).map(video => video.file)
        ];

        // Track media that should be deleted (for edit mode)
        const mediaToDelete = [];
        if (post && post.media) {
            // Find media from the original post that are no longer in formData
            post.media.forEach(originalMedia => {
                const stillExists = [...formData.images, ...formData.videos].some(
                    currentMedia => currentMedia.isExisting && currentMedia.fileName === originalMedia.fileName
                );
                if (!stillExists) {
                    mediaToDelete.push(originalMedia.fileName);
                }
            });
        }

        // const mentions = [];

        // // Extract hashtags from the content
        const hashtags = [];
        // const hashtagRegex = /<a[^>]*?class="[^"]*?hashtag[^"]*?"[^>]*?>(?:#)([^<]+)<\/a>/g;
        // let match;

        // Create a temporary div to parse the HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // Extract hashtags from the HTML links
        const hashtagLinks = tempDiv.querySelectorAll('a.' + styles.hashtag);
        hashtagLinks.forEach(link => {
            // Extract the hashtag name (without the # symbol)
            const hashtagName = link.textContent.substring(1); // Remove the # symbol
            if (hashtagName && !hashtags.includes(hashtagName)) {
                hashtags.push(hashtagName);
            }
        });

        // Prepare data for API
        const postData = {
            creatorId: currentUser.user.id,
            content: content,
            hashtags: hashtags
        };

        if (post) {
            // Update existing post
            postService.updatePost(post.id, postData, mediaFiles, mediaToDelete)
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
                    </div>                    {/* Media preview as slideshow */}
                    {(formData.images.length > 0 || formData.videos.length > 0) && (
                        <div className={styles['slideshow-container']}>
                            {/* Images slideshow */}
                            {formData.images.length > 0 && (
                                <div className={styles['slideshow']}>
                                    <div className={styles['slide']}>                                    {formData.images.length > currentImageIndex && formData.images[currentImageIndex] ? (
                                        <>
                                            <img
                                                src={formData.images[currentImageIndex].url || ''}
                                                alt="Preview"
                                                className={styles['slide-media']}
                                                onError={(e) => {
                                                    console.error("Image failed to load:", formData.images[currentImageIndex]);
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className={styles['remove-media']}
                                                onClick={() => removeMedia('images', formData.images[currentImageIndex].id)}
                                            >
                                                ×
                                            </button>
                                        </>
                                    ) : (
                                        <div className={styles['no-media']}>No images available</div>
                                    )}
                                    </div>                                {formData.images.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                className={`${styles['nav-button']} ${styles['prev']}`}
                                                onClick={() => {
                                                    if (formData.images.length > 0) {
                                                        setCurrentImageIndex(prev =>
                                                            prev === 0 ? formData.images.length - 1 : prev - 1
                                                        );
                                                    }
                                                }}
                                            >
                                                ❮
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles['nav-button']} ${styles['next']}`}
                                                onClick={() => {
                                                    if (formData.images.length > 0) {
                                                        setCurrentImageIndex(prev =>
                                                            prev === formData.images.length - 1 ? 0 : prev + 1
                                                        );
                                                    }
                                                }}
                                            >
                                                ❯
                                            </button>{/* Dots/indicators */}
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
                            )}                            {/* Videos */}
                            {formData.videos.length > 0 && formData.images.length === 0 && (
                                <div className={styles['videos-container']}>
                                    {formData.videos.map(video => (
                                        <div key={video.id} className={styles['media-item']}>
                                            {video.url && (
                                                <>
                                                    <video src={video.url} className={styles['media-thumbnail']} controls />
                                                    <button
                                                        type="button"
                                                        className={styles['remove-media']}
                                                        onClick={() => removeMedia('videos', video.id)}
                                                    >
                                                        ×
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}                    <div className={styles['editor-toolbar']}>
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
                        <button
                            type="button"
                            className={styles['toolbar-button']}
                            onClick={() => setShowHashtagDialog(true)}
                            title="Add Hashtag"
                            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                        >
                            #
                        </button>

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
                        )}

                    </div>
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

            {/* Hashtag Dialog */}
            {showHashtagDialog && (
                <div className={styles['hashtag-dialog']} ref={linkDialogRef}>
                    <div className={styles['hashtag-dialog-content']}>
                        <div className={styles['hashtag-dialog-header']}>
                            <h3>Add Hashtag</h3>
                            <button
                                type="button"
                                className={styles['close-dialog']}
                                onClick={() => setShowHashtagDialog(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles['hashtag-search']}>
                            <input
                                type="text"
                                placeholder="Search hashtags..."
                                value={hashtagSearch}
                                onChange={(e) => setHashtagSearch(e.target.value)}
                                className={styles['hashtag-search-input']}
                            />
                            <button
                                type="button"
                                className={styles['hashtag-search-button']}
                                onClick={() => searchHashtags(hashtagSearch)}
                                disabled={searching || !hashtagSearch.trim()}
                            >
                                {searching ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        <div className={styles['hashtag-results']}>
                            {
                                searching ? (
                                    <div className={styles['hashtag-loading']}>Searching hashtags...</div>
                                ) : hashtagSearchResults.length > 0 ? (
                                    <ul className={styles['hashtag-list']}>
                                        {hashtagSearchResults.map(tag => (
                                            <li
                                                key={tag.id}
                                                className={styles['hashtag-item']}
                                                onClick={() => insertHashtag(tag.name)}
                                            >
                                                <span className={styles['hashtag-name']}>#{tag.name}</span>

                                            </li>
                                        ))}
                                    </ul>
                                ) : searched ? (
                                    <div className={styles['no-hashtags']}>
                                        <p>No hashtags found. You can create a new one:</p>
                                        <button
                                            type="button"
                                            className={styles['create-hashtag']}
                                            onClick={() => insertHashtag(hashtagSearch.trim())}
                                        >
                                            Create #{hashtagSearch.trim()}
                                        </button>
                                    </div>
                                ) : (<></>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostForm;