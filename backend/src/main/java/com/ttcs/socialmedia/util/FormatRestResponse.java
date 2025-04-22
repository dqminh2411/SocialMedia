package com.ttcs.socialmedia.util;

import com.ttcs.socialmedia.domain.RestResponse;
import com.ttcs.socialmedia.util.annotation.ApiMessage;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
public class FormatRestResponse implements ResponseBodyAdvice<Object> {
    @Override
    @Nullable
    public Object beforeBodyWrite(@Nullable Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request,
                                  ServerHttpResponse response) {
        HttpServletResponse servletResponse = ((ServletServerHttpResponse) response).getServletResponse();
        int statusCode = servletResponse.getStatus();
        RestResponse<Object> resp = new RestResponse<Object>();
        resp.setStatusCode(statusCode);

        if(body instanceof String){
            return body;
        }
        // error states
        if (statusCode >= 400 || body instanceof RestResponse<?>) {
            return body; // body instanceof RestResponse
        } else {
            resp.setData(body);
            ApiMessage message = returnType.getMethodAnnotation(ApiMessage.class);
            resp.setMessage(message != null ? message.value() : "CALL API SUCCESS");
        }

        return resp;
    }

    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
        return true;
    }
}
