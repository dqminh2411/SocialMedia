package com.ttcs.socialmedia.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class SanitizeUtil {
    public static boolean containsHtml(String input){
        if(input == null) return false;
        String clean = Jsoup.clean(input, Safelist.none());
        return !input.equals(clean);
    }
    public static String clean(String input){
        if(input == null) return "";
        return Jsoup.clean(input, Safelist.basic());
    }
}
