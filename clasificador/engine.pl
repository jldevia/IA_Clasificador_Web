:- use_module(training_data).

classes(List):- List = [programming, mobile, web_development, devops, cloud, iot, ia, data_analytics, database,
                        security, so, net, integration, sof_engineering, blockchain, hardware, testing, unknown].

areLists(X, Y, Z) :- is_list(X) , is_list(Y), is_list(Z).

% Probabilidad condicional: La probabilidad del termino "Xi" en el "title" dada la clase "Class"
probCondTitle(Xi, Class, Prob):- findall(_, (case(Xs, _, _, Class), member(Xi, Xs)), ResultX),
                                    length(ResultX, CountX),
                                    findall(Class, case(_,_,_,Class), ResultY),
                                    length(ResultY, CountY),
                                    (CountY = 0 -> Prob is 0 ; Prob is (CountX / CountY)).

% Probabilidad condicional: La probabilidad del termino "Xi" en "keywords" dada la clase "Class"
probCondKeywords(Xi, Class, Prob):- findall(_, (case(_, Xs, _, Class), member(Xi, Xs)), ResultX),
                                length(ResultX, CountX),
                                findall(Class, case(_,_,_,Class), ResultY),
                                length(ResultY, CountY),
                                (CountY = 0 -> Prob is 0 ; Prob is (CountX / CountY)).

% Probabilidad condicional: La probabilidad del termino "Xi" en "descriptions" dada la clase "Class"
probCondDescription(Xi, Class, Prob):- findall(_, (case(_, _, Xs, Class), member(Xi, Xs)), ResultX),
                                length(ResultX, CountX),
                                findall(Class, case(_,_,_,Class), ResultY),
                                length(ResultY, CountY),
                                (CountY = 0 -> Prob is 0 ; Prob is (CountX / CountY)).

% Probabilidad a Priori de una clase: en este caso se toma como el n° de casos de la clase divido el n° total de casos.
probAPrioriClass(Class, Prob) :- findall(_, case(_,_,_,Class), Result),
                                length(Result, CountX),
                                findall(_, case(_,_,_,_), Result2),
                                length(Result2, CountY),
                                (CountX = 0 -> Prob is 0 ; Prob is CountX / CountY).

% Probabilidad conjunta de terminos en "title".
probConjTitle([], _, Prob):- Prob is 0.
probConjTitle([Xh|[]], Class, Prob) :- probCondTitle(Xh, Class, Prob).
probConjTitle([Xh|Xt], Class, Prob) :- probCondTitle(Xh, Class, R1),
                                        probConjTitle(Xt, Class, R2),
                                        Prob is R1 * R2.

% Probabilidad conjunta de terminos en "keywords".
probConjKeywords([],_, Prob):- Prob is 0.
probConjKeywords([Xh|[]], Class, Prob) :- probCondKeywords(Xh, Class, Prob).
probConjKeywords([Xh|Xt], Class, Prob) :- probCondKeywords(Xh, Class, R1),
                                            probConjKeywords(Xt, Class, R2),
                                            Prob is R1 * R2.

% Probabilidad conjunta de terminos en "description".
probConjDescription([],_, Prob):- Prob is 0.
probConjDescription([Xh|[]], Class, Prob) :- probCondDescription(Xh, Class, Prob).
probConjDescription([Xh|Xt], Class, Prob):- probCondDescription(Xh, Class, R1),
                                                probConjDescription(Xt, Class, R2),
                                                Prob is R1 * R2.

% Probabilidad Naive Bayes de los terminos del title para una clase dada.
naiveBayesTitle(Ts, Class, Prob) :- probConjTitle(Ts, Class, R1),
                                      probAPrioriClass(Class, R2),
                                      Prob is R1 * R2.

% Probabilidad Naive Bayes de los terminos en los "keywords" para una clase dada.
naiveBayesKeywords(Ks, Class, Prob) :- probConjKeywords(Ks, Class, R1),
                                        probAPrioriClass(Class, R2),
                                        Prob is R1 * R2.

% Probabilidad Naive Bayes de los terminos en "Description" para una clase dada.
naiveBayesDescription(Ds, Class, Prob) :- probConjDescription(Ds, Class, R1),
                                            probAPrioriClass(Class, R2),
                                            Prob is R1 * R2.                                      

% Probabilidad total del topic "unknown" es por defecto 0
probTotal(_,_,_,unknown, Prob) :- Prob is 0.

% Probabilidad total de una clase determinada
probTotal(Ts, Ks, Ds, Class, Prob):- naiveBayesTitle(Ts, Class, R1),
                                        naiveBayesKeywords(Ks, Class, R2),
                                        naiveBayesDescription(Ds, Class, R3),
                                        Prob is R1 + R2 + R3.

%Solucion: Se devuelve la clase con mayor probabilidad.
solution(Xs,Ys,Zs,[Class|[]], Result, Prob) :- probTotal(Xs,Ys,Zs, Class, R1),
                                               Result = Class,
                                               Prob = R1. 

solution(Xs, Ys, Zs, [Ch|Ct],Result, Prob):- probTotal(Xs,Ys, Zs, Ch, RP1),
                                                solution(Xs, Ys, Zs, Ct, RC1, RP2),
                                                (RP1 > RP2 -> (Result = Ch, Prob = RP1) ; (Result = RC1 , Prob = RP2)).
                                    
                                        
%Clasificador de clases aplicando Naive Bayes
classification(Xs, Ys, Zs, Class, Prob) :- areLists(Xs, Ys, Zs), 
                                            classes(Classes),
                                            solution(Xs, Ys, Zs, Classes, Class, Prob),
                                            !.
