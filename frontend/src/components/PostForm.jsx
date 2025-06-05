import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import styles from '../assets/css/PostForm.module.css';
import postService from '../services/post.service';
import authService from '../services/auth.service';
import { set } from 'date-fns';

const PostForm = ({ post = null, onSubmit }) => {

    const editorRef = useRef(null);
    const savedRangeRef = useRef(null)
    const fileInputRef = useRef(null);
    const linkDialogRef = useRef(null);


    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [formData, setFormData] = useState({
        content: post?.content || '',
        images: post?.images || [],
        videos: post?.videos || [],
    });


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


    useEffect(() => {
        if (post) {

            if (editorRef.current && post.content) {
                editorRef.current.innerHTML = post.content;
                setFormData(prev => ({ ...prev, content: post.content }));
            }
            if (post.media && post.media.length > 0) {
                const POST_MEDIA_URL = 'http://localhost:8080/storage/posts/';
                const images = [];
                const videos = [];

                post.media.forEach(media => {
                    if (!media.fileName) {
                        console.error('Missing fileName in media object:', media);
                        return;
                    }

                    const isVideo = media.fileName.match(/\.(mp4|webm|ogg)$/i);
                    const mediaItem = {
                        id: media.id || `existing-${Math.random().toString(36).substr(2, 9)}`,
                        fileName: media.fileName,
                        url: POST_MEDIA_URL + media.fileName,

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


    const insertHashtag = (hashtag) => {
        if (!savedRangeRef.current) return;


        editorRef.current.focus();


        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);


        const hashtagLink = `<a href="/hashtag/${hashtag}" class="${styles.hashtag}">#${hashtag}</a>&nbsp;`;


        const range = selection.getRangeAt(0);
        range.deleteContents();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = hashtagLink;

        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }

        range.insertNode(fragment);


        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);


        setShowHashtagDialog(false);


        handleContentChange();
    };




    const saveRange = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
        }
    }
    const handleContentChange = () => {
        if (!editorRef.current) return;

        const content = editorRef.current.innerHTML;
        setFormData(prev => {

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


    const insertTextAtCursor = (text) => {
        if (!editorRef.current) return;


        editorRef.current.focus();


        const selection = window.getSelection();
        if (selection.rangeCount > 0) {

            const range = selection.getRangeAt(0);


            range.deleteContents();


            const textNode = document.createTextNode(text);
            range.insertNode(textNode);


            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);


            handleContentChange();


            saveRange();
        }
    };


    const handleEmojiClick = (emojiObject) => {
        if (!savedRangeRef.current) return;

        const selection = window.getSelection();


        const range = savedRangeRef.current;




        const textNode = document.createTextNode(emojiObject.emoji);


        range.deleteContents();
        range.insertNode(textNode);


        range.setStartAfter(textNode);
        range.setEndAfter(textNode);

        selection.removeAllRanges();
        selection.addRange(range);


        setShowEmojiPicker(false);
        handleContentChange();
    };

    const handleMentionSelect = (username) => {
        if (!savedRangeRef.current) return;


        editorRef.current.focus();


        replaceTextBeforeCursor(/@\w*$/, `<span class="${styles.mention}">@${username}</span>&nbsp;`);
        setShowMentionSuggestions(false);


        editorRef.current.focus();
    };


    const handleHashtagSelect = (hashtag) => {
        if (!savedRangeRef.current) return;


        editorRef.current.focus();


        replaceTextBeforeCursor(/#\w*$/, `<span class="${styles.hashtag}">#${hashtag}</span>`);
        setShowHashtagSuggestions(false);


        editorRef.current.focus();
    };

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


        const deleteCount = lastMatch[0].length;
        const tempRange = range.cloneRange();


        tempRange.setStart(range.endContainer, range.endOffset - deleteCount);
        tempRange.setEnd(range.endContainer, range.endOffset);


        tempRange.deleteContents();


        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;


        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }

        range.insertNode(fragment);


        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);


        handleContentChange();
    };


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


    const insertLink = () => {
        if (!linkData.url) {
            setShowLinkDialog(false);
            return;
        }

        if (savedRangeRef) {


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


                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        setShowLinkDialog(false);
        handleContentChange();
    };


    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            if (file.type.startsWith('image/')) {

                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, {
                        id: Date.now() + Math.random(),
                        file,
                        url: URL.createObjectURL(file),
                    }]
                }));
            } else if (file.type.startsWith('video/')) {

                setFormData(prev => ({
                    ...prev,
                    videos: [...prev.videos, {
                        id: Date.now() + Math.random(),
                        file,
                        url: URL.createObjectURL(file),
                    }]
                }));
            }
        });


        e.target.value = '';
    };
    const removeMedia = (type, id) => {

        const indexToRemove = formData[type].findIndex(item => item.id === id);
        if (indexToRemove === -1) return;


        const isExistingMedia = formData[type][indexToRemove].isExisting;


        setFormData(prev => {
            const updatedItems = prev[type].filter(item => item.id !== id);


            if (type === 'images') {

                if (indexToRemove === currentImageIndex) {

                    if (indexToRemove === prev[type].length - 1 && indexToRemove > 0) {
                        setCurrentImageIndex(indexToRemove - 1);
                    }


                }

                else if (indexToRemove < currentImageIndex) {
                    setCurrentImageIndex(currentImageIndex - 1);
                }


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


        if (post && formData[type][indexToRemove] && formData[type][indexToRemove].isExisting) {

            const fileNameToDelete = formData[type][indexToRemove].fileName;
            console.log(`Marked existing media for deletion: ${fileNameToDelete}`);
        }
    };


    const handlePaste = (e) => {
        e.preventDefault();


        const text = e.clipboardData.getData('text/plain');


        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();


            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const parts = text.split(urlRegex);


            const fragment = document.createDocumentFragment();

            parts.forEach((part, index) => {
                if (index % 2 === 0) {

                    if (part) {
                        fragment.appendChild(document.createTextNode(part));
                    }
                } else {

                    link.href = part;
                    link.className = styles.url;
                    link.target = '_blank';
                    link.textContent = part;
                    fragment.appendChild(link);
                }
            });

            range.insertNode(fragment);


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


        const content = editorRef.current.innerHTML;


        if (!content.trim()) {
            setError("Post content cannot be empty");
            return;
        }


        setError(null);
        setIsSubmitting(true);
        setSuccess(false);


        const currentUser = authService.getCurrentUser();

        if (!currentUser || !currentUser.user) {
            setError('User not authenticated');
            setIsSubmitting(false);
            return;
        }
        const mediaFiles = [
            ...formData.images.filter(img => !img.isExisting).map(img => img.file),
            ...formData.videos.filter(video => !video.isExisting).map(video => video.file)
        ];


        const mediaToDelete = [];
        if (post && post.media) {

            post.media.forEach(originalMedia => {
                const stillExists = [...formData.images, ...formData.videos].some(
                    currentMedia => currentMedia.isExisting && currentMedia.fileName === originalMedia.fileName
                );
                if (!stillExists) {
                    mediaToDelete.push(originalMedia.fileName);
                }
            });
        }




        const hashtags = [];




        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;


        const hashtagLinks = tempDiv.querySelectorAll('a.' + styles.hashtag);
        hashtagLinks.forEach(link => {

            const hashtagName = link.textContent.substring(1);
            if (hashtagName && !hashtags.includes(hashtagName)) {
                hashtags.push(hashtagName);
            }
        });


        const postData = {
            creatorId: currentUser.user.id,
            content: content,
            hashtags: hashtags
        };

        if (post) {

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

            postService.createPost(postData, mediaFiles)
                .then(response => {
                    console.log('Post created successfully:', response);
                    setSuccess(true);
                    setIsSubmitting(false);

                    if (onSubmit) onSubmit(response);


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
                <div className={styles['form-group']}>                    { }
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
                    </div>                    { }
                    {(formData.images.length > 0 || formData.videos.length > 0) && (
                        <div className={styles['slideshow-container']}>
                            { }
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
                                            </button>{ }
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
                            )}                            { }
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
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            😀
                        </button>
                        <button
                            type="button"
                            className={styles['toolbar-button']}
                            onClick={openLinkDialog}
                            title="Insert Link"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            🔗
                        </button>
                        <button
                            type="button"
                            className={styles['toolbar-button']}
                            onClick={() => setShowHashtagDialog(true)}
                            title="Add Hashtag"
                            onMouseDown={(e) => e.preventDefault()}
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

            { }
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
